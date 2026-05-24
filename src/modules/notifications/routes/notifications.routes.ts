import type { FastifyInstance } from 'fastify';

import { requireRoles } from '@/middlewares/require-roles.middleware';
import {
  USER_ROLES,
} from '@/constants/roles';

export async function notificationsRoutes(
  app: FastifyInstance,
) {
  const requireAuthenticated = requireRoles([
    USER_ROLES.CLIENT,
    USER_ROLES.OWNER,
    USER_ROLES.AGENT,
  ]);

  app.get(
    '/',
    { preHandler: requireAuthenticated },
    async (_request, reply) => {
      return reply.send({
        success: true,
        data: [],
      });
    },
  );
}
