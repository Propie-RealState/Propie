import type {
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { authMiddleware } from './auth.middleware';
import { roleMiddleware } from './role.middleware';

/**
 * Requires a valid Bearer token and one of the allowed roles.
 */
export function requireRoles(allowedRoles: string[]) {
  const checkRole = roleMiddleware(allowedRoles);

  return async function (
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    await authMiddleware(request, reply);

    if (reply.sent) {
      return;
    }

    await checkRole(request, reply);
  };
}
