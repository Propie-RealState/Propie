import type { FastifyInstance } from 'fastify';

import { requireRoles } from '@/middlewares/require-roles.middleware';
import {
  USER_ROLES,
} from '@/constants/roles';

/**
 * Contact owner/agent — authenticated clients and publishers.
 */
export async function contactsRoutes(
  app: FastifyInstance,
) {
  const requireAuthenticated = requireRoles([
    USER_ROLES.CLIENT,
    USER_ROLES.OWNER,
    USER_ROLES.AGENT,
  ]);

  app.post(
    '/properties/:propertyId',
    { preHandler: requireAuthenticated },
    async (_request, reply) => {
      return reply.status(501).send({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Contact flow is not implemented yet',
        },
      });
    },
  );
}
