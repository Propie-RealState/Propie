import { db } from "@/database/client";
import {
  acceptsAgentParticipationSql,
  propertyCommercializationJoin,
} from "@/modules/properties/constants/commercialization-mode.constants";

import {
  escapeLikePattern,
  normalizeSearchText,
  sqlNormalizeColumn,
} from "../utils/normalize-search-text";

import {
  amenitySearchText,
  operationTypeSearchText,
  propertyTypeSearchText,
} from "../utils/search-labels";

const PROPERTY_TYPE_SQL = `
  CASE p.property_type
    WHEN 'HOUSE' THEN 'casa'
    WHEN 'APARTMENT' THEN 'departamento depto'
    WHEN 'LAND' THEN 'terreno lote'
    WHEN 'COMMERCIAL' THEN 'comercial local'
    WHEN 'OFFICE' THEN 'oficina'
    WHEN 'ROOM' THEN 'habitacion cuarto'
    ELSE ''
  END
`;

const OPERATION_TYPE_SQL = `
  CASE p.operation_type
    WHEN 'SALE' THEN 'venta'
    WHEN 'RENT' THEN 'alquiler'
    WHEN 'TEMPORARY' THEN 'temporario temporal'
    ELSE ''
  END
`;

function buildPattern(
  query: string,
): string {
  const normalized =
    normalizeSearchText(query);

  return `%${escapeLikePattern(normalized)}%`;
}

function buildMatchSql(
  columns: string[],
  paramIndex: number,
): string {
  const normalizedParam = `$${paramIndex}`;

  return columns
    .map(
      (column) =>
        `${sqlNormalizeColumn(column)} LIKE ${normalizedParam}`,
    )
    .join(" OR ");
}

export type PropertySearchRow = {
  id: string;
  title: string | null;
  description: string | null;
  property_type: string;
  operation_type: string;
  price: string | null;
  cover_image: string | null;
  city: string | null;
  province: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  amenities: string[] | null;
};

export type LocationSearchRow = {
  label: string;
  city: string | null;
  province: string | null;
  country: string | null;
  match_field: string;
};

export type UserSearchRow = {
  id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string;
  bio: string | null;
  average_rating: number;
  managed_properties: number;
};

export async function searchPropertiesRepository(
  query: string,
  limit: number,
  options: { forAgentDiscovery?: boolean } = {},
): Promise<PropertySearchRow[]> {
  const pattern = buildPattern(query);
  const bedroomsDigits = normalizeSearchText(query).replace(
    /\D/g,
    "",
  );
  const params: Array<string | number> = [
    pattern,
    limit,
  ];
  let bedroomsClause = "";

  if (bedroomsDigits) {
    params.push(bedroomsDigits);
    const bedroomsParam = `$${params.length}`;

    bedroomsClause = `
        OR p.bedrooms::text = ${bedroomsParam}
        OR ${sqlNormalizeColumn(
          "CONCAT(p.bedrooms::text, ' dormitorios')",
        )} LIKE $1`;
  }

  const commercializationJoin = options.forAgentDiscovery
    ? propertyCommercializationJoin("p", "pc")
    : "";
  const agentDiscoveryFilter = options.forAgentDiscovery
    ? `AND ${acceptsAgentParticipationSql("pc")}`
    : "";

  const result = await db.query(
    `
    SELECT
      p.id,
      p.title,
      p.description,
      p.property_type,
      p.operation_type,
      p.price::text,
      COALESCE(pi.thumb_url, pi.image_url) AS cover_image,
      l.city,
      l.province,
      l.neighborhood,
      p.bedrooms,
      ARRAY_REMOVE(ARRAY_AGG(DISTINCT pa.amenity), NULL) AS amenities
    FROM properties p
    LEFT JOIN property_locations l
      ON l.property_id = p.id
    LEFT JOIN property_images pi
      ON pi.property_id = p.id
      AND pi.is_cover = true
    LEFT JOIN property_amenities pa
      ON pa.property_id = p.id
    ${commercializationJoin}
    WHERE p.published_at IS NOT NULL
      AND p.status IN ('ACTIVE', 'PAUSED', 'RESERVED')
      ${agentDiscoveryFilter}
      AND (
        ${buildMatchSql(
          [
            "p.title",
            "p.description",
            "p.property_type",
            "p.operation_type",
            "l.city",
            "l.province",
            "l.neighborhood",
            "l.country",
            "l.address",
            "CAST(p.bedrooms AS TEXT)",
          ],
          1,
        )}
        OR ${sqlNormalizeColumn(PROPERTY_TYPE_SQL)} LIKE $1
        OR ${sqlNormalizeColumn(OPERATION_TYPE_SQL)} LIKE $1
        OR EXISTS (
          SELECT 1
          FROM property_amenities pa2
          WHERE pa2.property_id = p.id
            AND (
              ${sqlNormalizeColumn("pa2.amenity")} LIKE $1
              OR ${sqlNormalizeColumn(
                `CASE pa2.amenity
                  WHEN 'POOL' THEN 'pileta piscina'
                  WHEN 'PATIO' THEN 'patio'
                  WHEN 'BALCONY' THEN 'balcon'
                  WHEN 'PETS' THEN 'mascotas'
                  WHEN 'SECURITY' THEN 'seguridad'
                  WHEN 'GARAGE' THEN 'cochera garage'
                  WHEN 'GARDEN' THEN 'jardin'
                  WHEN 'ELEVATOR' THEN 'ascensor'
                  ELSE pa2.amenity
                END`,
              )} LIKE $1
            )
        )
        ${bedroomsClause}
      )
    GROUP BY
      p.id,
      p.title,
      p.description,
      p.property_type,
      p.operation_type,
      p.price,
      pi.thumb_url,
      pi.image_url,
      l.city,
      l.province,
      l.neighborhood,
      p.bedrooms
    ORDER BY p.created_at DESC
    LIMIT $2
    `,
    params,
  );

  return result.rows;
}

export async function searchLocationsRepository(
  query: string,
  limit: number,
): Promise<LocationSearchRow[]> {
  const pattern = buildPattern(query);

  const result = await db.query(
    `
    WITH location_rows AS (
      SELECT
        pl.neighborhood AS label,
        pl.city,
        pl.province,
        pl.country,
        'neighborhood' AS match_field
      FROM property_locations pl
      INNER JOIN properties p
        ON p.id = pl.property_id
        AND p.published_at IS NOT NULL
        AND p.status IN ('ACTIVE', 'PAUSED', 'RESERVED')
      WHERE pl.neighborhood IS NOT NULL
        AND ${buildMatchSql(["pl.neighborhood"], 1)}

      UNION ALL

      SELECT
        pl.city AS label,
        pl.city,
        pl.province,
        pl.country,
        'city' AS match_field
      FROM property_locations pl
      INNER JOIN properties p
        ON p.id = pl.property_id
        AND p.published_at IS NOT NULL
        AND p.status IN ('ACTIVE', 'PAUSED', 'RESERVED')
      WHERE pl.city IS NOT NULL
        AND ${buildMatchSql(["pl.city"], 1)}

      UNION ALL

      SELECT
        pl.province AS label,
        pl.city,
        pl.province,
        pl.country,
        'province' AS match_field
      FROM property_locations pl
      INNER JOIN properties p
        ON p.id = pl.property_id
        AND p.published_at IS NOT NULL
        AND p.status IN ('ACTIVE', 'PAUSED', 'RESERVED')
      WHERE pl.province IS NOT NULL
        AND ${buildMatchSql(["pl.province"], 1)}

      UNION ALL

      SELECT
        pl.address AS label,
        pl.city,
        pl.province,
        pl.country,
        'address' AS match_field
      FROM property_locations pl
      INNER JOIN properties p
        ON p.id = pl.property_id
        AND p.published_at IS NOT NULL
        AND p.status IN ('ACTIVE', 'PAUSED', 'RESERVED')
      WHERE pl.address IS NOT NULL
        AND ${buildMatchSql(["pl.address"], 1)}

      UNION ALL

      SELECT
        CONCAT_WS(' ', pl.address, pl.neighborhood, pl.city, pl.province, pl.country) AS label,
        pl.city,
        pl.province,
        pl.country,
        'full_address' AS match_field
      FROM property_locations pl
      INNER JOIN properties p
        ON p.id = pl.property_id
        AND p.published_at IS NOT NULL
        AND p.status IN ('ACTIVE', 'PAUSED', 'RESERVED')
      WHERE ${buildMatchSql(
        [
          "CONCAT_WS(' ', pl.address, pl.neighborhood, pl.city, pl.province, pl.country)",
        ],
        1,
      )}
    )
    SELECT DISTINCT ON (${sqlNormalizeColumn("label")})
      label,
      city,
      province,
      country,
      match_field
    FROM location_rows
    WHERE label IS NOT NULL
      AND TRIM(label) <> ''
    ORDER BY ${sqlNormalizeColumn("label")}, match_field
    LIMIT $2
    `,
    [pattern, limit],
  );

  return result.rows;
}

export async function searchAgentsRepository(
  query: string,
  limit: number,
): Promise<UserSearchRow[]> {
  const pattern = buildPattern(query);
  const usernameQuery = query.startsWith("@")
    ? query.slice(1)
    : query;

  const result = await db.query(
    `
    SELECT
      u.id,
      u.role,
      COALESCE(pr.first_name, u.first_name) AS first_name,
      COALESCE(pr.last_name, u.last_name) AS last_name,
      COALESCE(pr.avatar_url, u.avatar_url) AS avatar_url,
      u.email,
      pr.bio,
      COALESCE(rs.average_rating, 0)::float AS average_rating,
      COALESCE(wp.active_count, 0)::int AS managed_properties
    FROM users u
    LEFT JOIN profiles pr
      ON pr.user_id = u.id
    LEFT JOIN (
      SELECT
        target_user_id,
        ROUND(AVG(rating)::numeric, 1)::float AS average_rating
      FROM user_reviews
      GROUP BY target_user_id
    ) rs ON rs.target_user_id = u.id
    LEFT JOIN (
      SELECT
        agent_id,
        COUNT(*) FILTER (WHERE is_active = true)::int AS active_count
      FROM property_assignments
      GROUP BY agent_id
    ) wp ON wp.agent_id = u.id
    WHERE u.role = 'AGENT'
      AND u.is_active = true
      AND (
        ${buildMatchSql(
          [
            "COALESCE(pr.first_name, u.first_name)",
            "COALESCE(pr.last_name, u.last_name)",
            "CONCAT_WS(' ', COALESCE(pr.first_name, u.first_name), COALESCE(pr.last_name, u.last_name))",
            "pr.bio",
            "split_part(u.email, '@', 1)",
          ],
          1,
        )}
        OR ${sqlNormalizeColumn("split_part(u.email, '@', 1)")} LIKE $2
      )
    ORDER BY COALESCE(rs.average_rating, 0) DESC, managed_properties DESC
    LIMIT $3
    `,
    [
      pattern,
      buildPattern(usernameQuery),
      limit,
    ],
  );

  return result.rows;
}

export async function searchOwnersRepository(
  query: string,
  limit: number,
): Promise<UserSearchRow[]> {
  const pattern = buildPattern(query);

  const result = await db.query(
    `
    SELECT
      u.id,
      u.role,
      COALESCE(pr.first_name, u.first_name) AS first_name,
      COALESCE(pr.last_name, u.last_name) AS last_name,
      COALESCE(pr.avatar_url, u.avatar_url) AS avatar_url,
      u.email,
      pr.bio,
      COALESCE(rs.average_rating, 0)::float AS average_rating,
      COALESCE(opc.active_count, 0)::int AS managed_properties
    FROM users u
    LEFT JOIN profiles pr
      ON pr.user_id = u.id
    LEFT JOIN (
      SELECT
        target_user_id,
        ROUND(AVG(rating)::numeric, 1)::float AS average_rating
      FROM user_reviews
      GROUP BY target_user_id
    ) rs ON rs.target_user_id = u.id
    LEFT JOIN (
      SELECT
        owner_id,
        COUNT(*) FILTER (
          WHERE published_at IS NOT NULL
            AND status IN ('ACTIVE', 'PAUSED', 'RESERVED')
        )::int AS active_count
      FROM properties
      GROUP BY owner_id
    ) opc ON opc.owner_id = u.id
    WHERE u.role = 'OWNER'
      AND u.is_active = true
      AND (
        ${buildMatchSql(
          [
            "COALESCE(pr.first_name, u.first_name)",
            "COALESCE(pr.last_name, u.last_name)",
            "CONCAT_WS(' ', COALESCE(pr.first_name, u.first_name), COALESCE(pr.last_name, u.last_name))",
            "split_part(u.email, '@', 1)",
          ],
          1,
        )}
      )
    ORDER BY managed_properties DESC
    LIMIT $2
    `,
    [pattern, limit],
  );

  return result.rows;
}

export function buildPropertyHaystack(
  row: PropertySearchRow,
): string {
  const amenities = (row.amenities ?? [])
    .map((amenity) => amenitySearchText(amenity))
    .join(" ");

  const bedroomText = row.bedrooms
    ? `${row.bedrooms} dormitorios`
    : "";

  return [
    row.title,
    row.description,
    propertyTypeSearchText(row.property_type),
    operationTypeSearchText(row.operation_type),
    row.city,
    row.province,
    row.neighborhood,
    bedroomText,
    amenities,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildLocationHaystack(
  row: LocationSearchRow,
): string {
  return [
    row.label,
    row.city,
    row.province,
    row.country,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildUserHaystack(
  row: UserSearchRow,
): string {
  const emailUsername = row.email.split("@")[0] ?? "";

  return [
    row.first_name,
    row.last_name,
    `${row.first_name ?? ""} ${row.last_name ?? ""}`,
    `@${emailUsername}`,
    emailUsername,
    row.bio,
  ]
    .filter(Boolean)
    .join(" ");
}
