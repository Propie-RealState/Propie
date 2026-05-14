import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { db } from '../../database/client';

import {
  findUserByEmail,
} from '../../database/repositories/user.repository';

import type {
  LoginInput,
  RegisterInput,
  AuthUser,
} from '../../database/types/auth';

import {
  generateAccessToken,
  generateRefreshToken,
} from './jwt';



// ========================================================
// REGISTER
// ========================================================

export async function register(
  input: RegisterInput
) {

  // ======================================================
  // CHECK EMAIL
  // ======================================================

  const existingUser =
    await db.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
      `,
      [
        input.email,
      ]
    );

  if (
    existingUser.rows.length > 0
  ) {
    throw new Error(
      'EMAIL_ALREADY_EXISTS'
    );
  }



  // ======================================================
  // HASH PASSWORD
  // ======================================================

  const passwordHash =
    await bcrypt.hash(
      input.password,
      10
    );



  // ======================================================
  // CREATE USER
  // ======================================================

  const userResult =
    await db.query<AuthUser>(
      `
        INSERT INTO users (
          id,
          first_name,
          last_name,
          email,
          password_hash,
          role
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING *
      `,
      [
        randomUUID(),

        input.firstName,

        input.lastName,

        input.email,

        passwordHash,

        input.role,
      ]
    );

  const user =
    userResult.rows[0];



  // ======================================================
  // TOKENS
  // ======================================================

  const accessToken =
    generateAccessToken({
      userId: user.id,

      email: user.email,

      role: user.role,
    });

  const refreshToken =
    generateRefreshToken(
      {
        userId: user.id,

        email: user.email,

        role: user.role,
      }
    );



  // ======================================================
  // RESPONSE
  // ======================================================

  return {
    accessToken,

    refreshToken,

    user,
  };
}



// ========================================================
// LOGIN
// ========================================================

export async function login(
  input: LoginInput
) {

  // ======================================================
  // FIND USER
  // ======================================================

  const user =
    await findUserByEmail(
      input.email
    );

  if (!user) {
    throw new Error(
      'INVALID_CREDENTIALS'
    );
  }



  // ======================================================
  // CHECK PASSWORD
  // ======================================================

  const passwordMatch =
    await bcrypt.compare(
      input.password,

      user.passwordHash
    );

  if (!passwordMatch) {
    throw new Error(
      'INVALID_CREDENTIALS'
    );
  }



  // ======================================================
  // TOKENS
  // ======================================================

  const accessToken =
    generateAccessToken({
      userId: user.id,

      email: user.email,

      role: user.role,
    });

  const refreshToken =
    generateRefreshToken(
      {
        userId: user.id,

        email: user.email,

        role: user.role,
      }
    );



  // ======================================================
  // RESPONSE
  // ======================================================

  const {
    passwordHash: _passwordHash,

    ...authUser
  } = user;

  return {
    accessToken,

    refreshToken,

    user: authUser,
  };
}