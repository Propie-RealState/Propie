import type {
    FastifyReply,
    FastifyRequest,
  } from 'fastify';
  
  import {
    verifyAccessToken,
  } from '@/services/auth/jwt';
  
  
  
  // ========================================================
  // AUTH REQUEST
  // ========================================================
  
  export type AuthenticatedRequest =
    FastifyRequest & {
      user: {
        userId: string;
  
        email: string;
  
        role: string;
      };
    };
  
  
  
  // ========================================================
  // AUTH MIDDLEWARE
  // ========================================================
  
  export async function authMiddleware(
    request: FastifyRequest,
  
    reply: FastifyReply
  ) {
    try {
      const authorization =
        request.headers.authorization;
  
      if (!authorization) {
        return reply
          .status(401)
          .send({
            success: false,
  
            error: {
              code:
                'UNAUTHORIZED',
  
              message:
                'Missing authorization header',
  
              statusCode: 401,
            },
          });
      }
  
      const token =
        authorization.replace(
          'Bearer ',
          ''
        );
  
      const payload =
        verifyAccessToken(
          token
        );
  
      (
        request as AuthenticatedRequest
      ).user = {
        userId: payload.sub,
  
        email: payload.email,
  
        role: payload.role,
      };
    } catch {
      return reply
        .status(401)
        .send({
          success: false,
  
          error: {
            code:
              'UNAUTHORIZED',
  
            message:
              'Invalid token',
  
            statusCode: 401,
          },
        });
    }
  }