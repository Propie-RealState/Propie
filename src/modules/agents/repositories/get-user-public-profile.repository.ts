import { db } from "@/database/client";

export type UserPublicProfileRow = {
  id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  member_since: string;
  total_reviews: number;
  average_rating: number;
  five_stars: number;
  four_stars: number;
  three_stars: number;
  two_stars: number;
  one_star: number;
  owner_active_properties: number;
};

export async function getUserPublicProfileRepository(
  userId: string,
): Promise<UserPublicProfileRow | null> {
  const result = await db.query<UserPublicProfileRow>(
    `
      SELECT
        u.id,
        u.role,
        pr.first_name,
        pr.last_name,
        pr.avatar_url,
        pr.bio,
        pr.location,
        pr.created_at AS member_since,
        COALESCE(rs.total_reviews, 0)::int AS total_reviews,
        COALESCE(rs.average_rating, 0)::float AS average_rating,
        COALESCE(rs.five_stars, 0)::int AS five_stars,
        COALESCE(rs.four_stars, 0)::int AS four_stars,
        COALESCE(rs.three_stars, 0)::int AS three_stars,
        COALESCE(rs.two_stars, 0)::int AS two_stars,
        COALESCE(rs.one_star, 0)::int AS one_star,
        COALESCE(opc.active_count, 0)::int AS owner_active_properties
      FROM users u
      LEFT JOIN profiles pr ON pr.user_id = u.id
      LEFT JOIN (
        SELECT
          target_user_id,
          COUNT(*)::int AS total_reviews,
          ROUND(AVG(rating)::numeric, 1)::float AS average_rating,
          COUNT(*) FILTER (WHERE rating = 5)::int AS five_stars,
          COUNT(*) FILTER (WHERE rating = 4)::int AS four_stars,
          COUNT(*) FILTER (WHERE rating = 3)::int AS three_stars,
          COUNT(*) FILTER (WHERE rating = 2)::int AS two_stars,
          COUNT(*) FILTER (WHERE rating = 1)::int AS one_star
        FROM user_reviews
        GROUP BY target_user_id
      ) rs ON rs.target_user_id = u.id
      LEFT JOIN (
        SELECT owner_id, COUNT(*) FILTER (WHERE status = 'ACTIVE' AND published_at IS NOT NULL)::int AS active_count
        FROM properties
        GROUP BY owner_id
      ) opc ON opc.owner_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}
