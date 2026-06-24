import type {
    FastifyReply,
    FastifyRequest,
  } from 'fastify';

import { hasAnyRole } from '@/utils/authorization';
  
  
  
  // ========================================================
  // ROLE MIDDLEWARE
  // ========================================================
  
  export function roleMiddleware(
    allowedRoles: string[]
  ) {
    return async function (
      request: FastifyRequest,
  
      reply: FastifyReply
    ) {
  
      // ====================================================
      // USER
      // ====================================================
  
      const user =
        request.user;
  
      if (!user) {
        return reply
          .status(401)
          .send({
            success: false,
  
            error: {
              code:
                'UNAUTHORIZED',
  
              message:
                'Authentication required',
            },
          });
      }
  
  
  
      // ====================================================
      // ROLE VALIDATION
      // ====================================================
  
      const hasPermission =
        hasAnyRole(
          user.role,
          allowedRoles,
        );
  
      if (!hasPermission) {
        return reply
          .status(403)
          .send({
            success: false,
  
            error: {
              code:
                'FORBIDDEN',
  
              message:
                'Insufficient permissions',
            },
          });
      }
    };
  }