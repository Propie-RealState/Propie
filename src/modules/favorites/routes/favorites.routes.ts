import type { FastifyInstance } from 'fastify';

import { requireRoles } from '@/middlewares/require-roles.middleware';
import {
  USER_ROLES,
} from '@/constants/roles';

export async function favoritesRoutes(
  app: FastifyInstance,
) {
  const requireClient = requireRoles([
    USER_ROLES.CLIENT,
    USER_ROLES.OWNER,
    USER_ROLES.AGENT,
  ]);

  app.get(
    '/',
    { preHandler: requireClient },
    async (_request, reply) => {
      return reply.send({
        success: true,
        data: [],
      });
    },
  );

  app.post(
    '/:propertyId',
    { preHandler: requireClient },
    async (_request, reply) => {
      return reply.status(501).send({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Favorites persistence is not implemented yet',
        },
      });
    },
  );

  app.delete(
    '/:propertyId',
    { preHandler: requireClient },
    async (_request, reply) => {
      return reply.status(501).send({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Favorites persistence is not implemented yet',
        },
      });
    },
  );
}
