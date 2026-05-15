import {
  FastifyInstance,
} from 'fastify';

import {
  RegisterSchema,
} from '../modules/auth/schemas/register.schema';

import { hashPassword }
  from '../modules/auth/utils/hash-password';

import {
  createUser,
  findUserByEmail,
} from '../database/repositories/user.repository';

import {
  login,
} from '../services/auth/auth.service';

// ========================================================
// REGISTER ROUTE
// ========================================================

export async function registerRoute(
  app: FastifyInstance
) {
  app.post(
    '/auth/register',

    async (
      request,
      reply
    ) => {

      // =====================================
      // VALIDATE
      // =====================================

      const parsed =
        RegisterSchema.safeParse(
          request.body
        );

      if (!parsed.success) {
        return reply
          .status(400)
          .send({
            error:
              'VALIDATION_ERROR',

            details:
              parsed.error.flatten(),
          });
      }

      // =====================================
      // VALID DATA
      // =====================================

      const data =
        parsed.data;
      const existingUser =
        await findUserByEmail(
          data.email
        );

      if (existingUser) {
        return reply
          .status(409)
          .send({
            error:
              'EMAIL_ALREADY_EXISTS',
          });
      }
      // =====================================
      // HASH PASSWORD
      // =====================================

      const passwordHash =
        await hashPassword(
          data.password
        );

      // =====================================
      // CREATE USER
      // =====================================

      const user =
        await createUser({
          firstName:
            data.firstName,

          lastName:
            data.lastName,

          email:
            data.email,

          passwordHash,

          role:
            data.role,

        });
      // =====================================
      // AUTO LOGIN
      // =====================================

      const authData =
        await login({
          email:
            data.email,

          password:
            data.password,
        });

      // =====================================
      // RESPONSE
      // =====================================

      return reply
        .status(201)
        .send({
          success: true,

          data: authData,
        });
    }
  );
}