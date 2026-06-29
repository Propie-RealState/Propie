import { FastifyInstance } from "fastify";

import { RegisterSchema } from "../modules/auth/schemas/register.schema";

import { hashPassword } from "../modules/auth/utils/hash-password";

import {
  createUser,
  findUserByEmail,
} from "../database/repositories/user.repository";

import { createProfile } from "@/modules/profiles/repositories/profiles.repository";
import { rateLimitRouteConfig } from "@/config/rate-limit";
import { isPublicRegistrationEnabled } from "@/config/public-registration";
import { issueEmailVerificationCode } from "@/services/auth/email-verification.service";

// ========================================================
// REGISTER ROUTE
// ========================================================

export async function registerRoute(app: FastifyInstance) {
  app.post(
    "/auth/register",
    { config: rateLimitRouteConfig("authRegister") },

    async (request, reply) => {
      if (!isPublicRegistrationEnabled()) {
        return reply.status(403).send({
          error: "REGISTRATION_DISABLED",
        });
      }

      const parsed = RegisterSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",

          details: parsed.error.flatten(),
        });
      }

      // =====================================
      // VALID DATA
      // =====================================

      const data = parsed.data;
      const existingUser = await findUserByEmail(data.email);

      if (existingUser) {
        return reply.status(409).send({
          error: "EMAIL_ALREADY_EXISTS",
        });
      }
      // =====================================
      // HASH PASSWORD
      // =====================================

      const passwordHash = await hashPassword(data.password);

      // =====================================
      // CREATE USER
      // =====================================

      const user = await createUser({
        firstName: data.firstName,

        lastName: data.lastName,

        email: data.email,

        passwordHash,

        role: data.role,
      });

      await createProfile({
        userId: user.id,

        firstName: data.firstName,

        lastName: data.lastName,

        phone: data.phone,

        dni: data.dni,

        birth_date: data.birthDate,

        nationality: data.nationality,

        cuit_cuil: data.cuitCuil,

        location: data.location ?? data.address,

        address: data.address,

        bio: data.bio,

        // Avatar is uploaded separately via POST /profile/me/avatar after registration.
      });

      await issueEmailVerificationCode({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
      });

      // =====================================
      // RESPONSE
      // =====================================

      return reply.status(201).send({
        success: true,

        data: {
          email: user.email,
          requiresVerification: true,
        },
      });
    },
  );
}
