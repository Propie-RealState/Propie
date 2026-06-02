import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { getAgentPublicProfileRepository } from "../repositories/agent-public-profile.repository";
import {
  createUserReviewRepository,
  getUserReviewsRepository,
  getUserReviewStatsRepository,
} from "../repositories/user-reviews.repository";
import {
  canReviewRepository,
  getReviewablePropertiesRepository,
} from "../repositories/can-review.repository";
import { db } from "../../../database/client";

const CreateReviewSchema = z.object({
  propertyId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).nullable().optional(),
});

export async function agentsRoutes(app: FastifyInstance) {
  // ============================================================
  // GET /agents/users/:userId/public — public profile for any role
  // Returns: basic info + stats (reviews, rating, properties)
  // ============================================================

  app.get("/users/:userId/public", async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const result = await db.query(
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
        -- Agent-specific: properties worked
        COALESCE(wp.total_worked, 0)::int AS total_worked_properties,
        COALESCE(wp.active_count, 0)::int AS active_properties,
        COALESCE(wp.completed_count, 0)::int AS completed_properties,
        -- Owner-specific: published properties
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
        SELECT
          agent_id,
          COUNT(*)::int AS total_worked,
          COUNT(*) FILTER (WHERE is_active = true)::int AS active_count,
          COUNT(*) FILTER (WHERE is_active = false)::int AS completed_count
        FROM property_assignments
        GROUP BY agent_id
      ) wp ON wp.agent_id = u.id
      LEFT JOIN (
        SELECT owner_id, COUNT(*) FILTER (WHERE status = 'PUBLISHED')::int AS active_count
        FROM properties
        GROUP BY owner_id
      ) opc ON opc.owner_id = u.id
      WHERE u.id = $1
      LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];

    if (!row) {
      return reply.status(404).send({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User not found" },
      });
    }

    return reply.send({
      success: true,
      data: {
        id: row.id,
        role: row.role,
        first_name: row.first_name,
        last_name: row.last_name,
        avatar_url: row.avatar_url,
        bio: row.bio,
        location: row.location,
        member_since: row.member_since,
        total_reviews: row.total_reviews,
        average_rating: row.average_rating,
        rating_distribution: {
          five: row.five_stars,
          four: row.four_stars,
          three: row.three_stars,
          two: row.two_stars,
          one: row.one_star,
        },
        total_worked_properties: row.total_worked_properties,
        active_properties:
          row.role === "AGENT"
            ? row.active_properties
            : row.owner_active_properties,
        completed_properties: row.completed_properties,
      },
    });
  });

  // ============================================================
  // GET /agents/users/:userId/can-review — auth required
  // ?propertyId=xxx  (optional - checks specific property)
  // Returns: { canReview, reason, reviewableProperties }
  // ============================================================

  app.get(
    "/users/:userId/can-review",
    { preHandler: authMiddleware },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const query = request.query as { propertyId?: string };
      const reviewerUserId = request.user.id;

      if (reviewerUserId === userId) {
        return reply.send({
          success: true,
          data: { canReview: false, reason: "SELF_REVIEW", reviewableProperties: [] },
        });
      }

      // If specific property provided, check that one
      if (query.propertyId) {
        const result = await canReviewRepository({
          propertyId: query.propertyId,
          reviewerUserId,
          targetUserId: userId,
        });

        return reply.send({ success: true, data: { ...result, reviewableProperties: [] } });
      }

      // Otherwise return all properties where review is possible
      const reviewableProperties = await getReviewablePropertiesRepository({
        reviewerUserId,
        targetUserId: userId,
      });

      return reply.send({
        success: true,
        data: {
          canReview: reviewableProperties.length > 0,
          reason: reviewableProperties.length > 0 ? "OK" : "NO_ASSIGNMENT",
          reviewableProperties,
        },
      });
    },
  );

  // ============================================================
  // GET /agents/users/:userId/reviews — public
  // ============================================================

  app.get("/users/:userId/reviews", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const query = request.query as { limit?: string; offset?: string };

    const reviews = await getUserReviewsRepository({
      targetUserId: userId,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    });

    return reply.send({ success: true, data: reviews });
  });

  // ============================================================
  // POST /agents/users/:userId/reviews — authenticated
  // ============================================================

  app.post(
    "/users/:userId/reviews",
    { preHandler: authMiddleware },
    async (request, reply) => {
      const { userId: targetUserId } = request.params as { userId: string };
      const reviewerUserId = request.user.id;

      let body: z.infer<typeof CreateReviewSchema>;

      try {
        body = CreateReviewSchema.parse(request.body);
      } catch {
        return reply.status(400).send({
          success: false,
          error: { code: "INVALID_BODY", message: "Invalid request body" },
        });
      }

      // Validate permission
      const { canReview, reason } = await canReviewRepository({
        propertyId: body.propertyId,
        reviewerUserId,
        targetUserId,
      });

      if (!canReview) {
        const messages: Record<string, string> = {
          SELF_REVIEW: "No podés calificarte a vos mismo",
          NO_ASSIGNMENT: "Solo podés calificar a personas con las que trabajaste",
          ALREADY_REVIEWED: "Ya calificaste a esta persona para esta propiedad",
        };
        return reply.status(403).send({
          success: false,
          error: { code: reason, message: messages[reason] ?? "No permitido" },
        });
      }

      // Get roles for both users
      const rolesResult = await db.query(
        `SELECT id, role FROM users WHERE id = ANY($1)`,
        [[reviewerUserId, targetUserId]],
      );

      const reviewerRow = rolesResult.rows.find((r) => r.id === reviewerUserId);
      const targetRow = rolesResult.rows.find((r) => r.id === targetUserId);

      if (!reviewerRow || !targetRow) {
        return reply.status(404).send({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      }

      const review = await createUserReviewRepository({
        targetUserId,
        reviewerUserId,
        propertyId: body.propertyId,
        reviewerRole: reviewerRow.role as "OWNER" | "AGENT" | "CLIENT",
        targetRole: targetRow.role as "OWNER" | "AGENT" | "CLIENT",
        rating: body.rating,
        comment: body.comment ?? null,
      });

      return reply.status(201).send({ success: true, data: review });
    },
  );

  // ============================================================
  // GET /agents/:agentId/profile — public full agent profile
  // ============================================================

  app.get("/:agentId/profile", async (request, reply) => {
    const { agentId } = request.params as { agentId: string };

    const profile = await getAgentPublicProfileRepository(agentId);

    if (!profile) {
      return reply.status(404).send({
        success: false,
        error: { code: "AGENT_NOT_FOUND", message: "Agent not found" },
      });
    }

    return reply.send({ success: true, data: profile });
  });

  // ============================================================
  // Legacy: GET /agents/:agentId/reviews — kept for backward compat
  // Delegates to user reviews
  // ============================================================

  app.get("/:agentId/reviews", async (request, reply) => {
    const { agentId } = request.params as { agentId: string };
    const query = request.query as { limit?: string; offset?: string };

    const reviews = await getUserReviewsRepository({
      targetUserId: agentId,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    });

    return reply.send({ success: true, data: reviews });
  });
}
