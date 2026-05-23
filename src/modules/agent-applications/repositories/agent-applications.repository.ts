import { db } from "@/database/client";

export async function createAgentApplicationRepository(input: {
  propertyId: string;
  agentId: string;
  message: string | null;
}) {
  const result = await db.query(
    `
      INSERT INTO agent_applications (
        property_id,
        agent_id,
        message
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (property_id, agent_id)
      WHERE status = 'PENDING'
      DO UPDATE SET
        message = EXCLUDED.message,
        updated_at = now()
      RETURNING *
    `,
    [input.propertyId, input.agentId, input.message],
  );

  return result.rows[0];
}

export async function getOwnerAgentApplicationsRepository(ownerId: string) {
  const result = await db.query(
    `
      SELECT
        aa.id,
        aa.property_id,
        aa.agent_id,
        aa.message,
        aa.status,
        aa.created_at,
        aa.updated_at,
        p.title AS property_title,
        p.price AS property_price,
        p.operation_type AS property_operation_type,
        pl.city AS property_city,
        pl.neighborhood AS property_neighborhood,
        pl.address AS property_address,
        u.email AS agent_email,
        pr.first_name AS agent_first_name,
        pr.last_name AS agent_last_name,
        pr.phone AS agent_phone,
        pr.avatar_url AS agent_avatar_url
      FROM agent_applications aa
      INNER JOIN properties p
        ON p.id = aa.property_id
      LEFT JOIN property_locations pl
        ON pl.property_id = p.id
      INNER JOIN users u
        ON u.id = aa.agent_id
      LEFT JOIN profiles pr
        ON pr.user_id = u.id
      WHERE p.owner_id = $1
      ORDER BY aa.created_at DESC
    `,
    [ownerId],
  );

  return result.rows;
}

export async function getAgentApplicationByPropertyRepository(input: {
  propertyId: string;
  agentId: string;
}) {
  const result = await db.query(
    `
      SELECT
        id,
        property_id,
        agent_id,
        message,
        status,
        created_at,
        updated_at
      FROM agent_applications
      WHERE property_id = $1
        AND agent_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [input.propertyId, input.agentId],
  );

  return result.rows[0] ?? null;
}

export async function countPendingOwnerAgentApplicationsRepository(
  ownerId: string,
) {
  const result = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM agent_applications aa
      INNER JOIN properties p
        ON p.id = aa.property_id
      WHERE p.owner_id = $1
        AND aa.status = 'PENDING'
    `,
    [ownerId],
  );

  return result.rows[0]?.count ?? 0;
}

export async function updateOwnerAgentApplicationStatusRepository(input: {
  applicationId: string;
  ownerId: string;
  status: "ACCEPTED" | "REJECTED";
}) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        UPDATE agent_applications aa
        SET
          status = $3,
          updated_at = now()
        FROM properties p
        WHERE aa.id = $1
          AND aa.property_id = p.id
          AND p.owner_id = $2
          AND aa.status = 'PENDING'
        RETURNING
          aa.*,
          p.owner_id
      `,
      [input.applicationId, input.ownerId, input.status],
    );

    const application = result.rows[0];

    if (application && input.status === "ACCEPTED") {
      await client.query(
        `
          INSERT INTO property_assignments (
            property_id,
            agent_id,
            assigned_by
          )
          VALUES ($1, $2, $3)
          ON CONFLICT (property_id)
          WHERE is_active = true
          DO NOTHING
        `,
        [
          application.property_id,
          application.agent_id,
          input.ownerId,
        ],
      );
    }

    await client.query("COMMIT");

    return application ?? null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
