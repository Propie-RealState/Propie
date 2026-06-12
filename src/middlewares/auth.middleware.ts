import type {
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import {
  verifyAccessToken,
} from '../services/auth/jwt';



// ========================================================
// AUTH USER
// ========================================================

type AuthenticatedUser = {
  id: string;

  email: string;

  role: string;
};



// ========================================================
// FASTIFY TYPES
// ========================================================

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser;
  }
}



// ========================================================
// AUTH MIDDLEWARE
// Guest = no Authorization header (no DB role).
// ========================================================

export async function authMiddleware(
  request: FastifyRequest,

  reply: FastifyReply
) {
  try {

    // ====================================================
    // AUTH HEADER
    // ====================================================

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
          },
        });
    }



    // ====================================================
    // TOKEN
    // ====================================================

    const token =
      authorization.replace(
        'Bearer ',
        ''
      );



    // ====================================================
    // VERIFY TOKEN
    // ====================================================

    const payload =
      verifyAccessToken(
        token
      );



    // ====================================================
    // REQUEST USER
    // ====================================================

    request.user = {
      id: payload.sub,

      email:
        payload.email,

      role:
        payload.role,
    };

  } catch (error) {

    console.error(error);

    return reply
      .status(401)
      .send({
        success: false,

        error: {
          code:
            'INVALID_TOKEN',

          message:
            'Invalid access token',
        },
      });
  }
}

export async function optionalAuthMiddleware(
  request: FastifyRequest,
) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return;
  }

  try {
    const token = authorization.replace("Bearer ", "");
    const payload = verifyAccessToken(token);

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // guest continues
  }
}