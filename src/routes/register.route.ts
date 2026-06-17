import { FastifyInstance } from "fastify";

import { RegisterSchema } from "../modules/auth/schemas/register.schema";

import { hashPassword } from "../modules/auth/utils/hash-password";

import {
  createUser,
  findUserByEmail,
} from "../database/repositories/user.repository";

import { login } from "../services/auth/auth.service";
import { createProfile } from "@/modules/profiles/repositories/profiles.repository";
import { rateLimitRouteConfig } from "@/config/rate-limit";

// ========================================================
// REGISTER ROUTE
// ========================================================

export async function registerRoute(app: FastifyInstance) {
  app.post(
    "/auth/register",
    { config: rateLimitRouteConfig("authRegister") },

    async (request, reply) => {
      // =====================================
      // VALIDATE
      // =====================================

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
      const emailLocal = data.email.split("@")[0] ?? "usuario";
      const nameParts = emailLocal.replace(/[._-]/g, " ").split(/\s+/).filter(Boolean);
      const firstName =
        data.firstName ??
        (nameParts[0]
          ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)
          : "Usuario");
      const lastName =
        data.lastName ??
        (nameParts[1]
          ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
          : "Nuevo");

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
        firstName,

        lastName,

        email: data.email,

        passwordHash,

        role: data.role,
      });

      await createProfile({
        userId: user.id,

        firstName,

        lastName,

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

      // =====================================
      // AUTO LOGIN
      // =====================================

      const authData = await login({
        email: data.email,

        password: data.password,
      });

      // =====================================
      // RESPONSE
      // =====================================

      return reply.status(201).send({
        success: true,

        data: authData,
      });
    },
  );
}
