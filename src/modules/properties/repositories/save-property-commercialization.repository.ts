import { db }
  from "@/database/client";

type Input = {
  propertyId: string;

  commercializationType:
    "AGENTS"
    | "AGENCIES"
    | "BOTH"
    | "DIRECT";

  manualApproval: boolean;

  allowChat: boolean;

  sharedCalendar: boolean;
};

export async function savePropertyCommercializationRepository(
  input: Input
) {

  const result =
    await db.query(
      `
        INSERT INTO property_commercialization (
          property_id,
          commercialization_type,
          manual_approval,
          allow_chat,
          shared_calendar
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )

        ON CONFLICT (property_id)

        DO UPDATE SET
          commercialization_type =
            EXCLUDED.commercialization_type,

          manual_approval =
            EXCLUDED.manual_approval,

          allow_chat =
            EXCLUDED.allow_chat,

          shared_calendar =
            EXCLUDED.shared_calendar,

          updated_at = now()

        RETURNING *
      `,
      [
        input.propertyId,

        input.commercializationType,

        input.manualApproval,

        input.allowChat,

        input.sharedCalendar,
      ]
    );

  return result.rows[0];
}