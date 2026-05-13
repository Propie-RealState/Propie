import jwt from 'jsonwebtoken';

import {
  generateAccessToken,
  generateRefreshToken,
} from './jwt';



// ========================================================
// REFRESH SESSION
// ========================================================

export async function refreshSession(
  refreshToken: string
) {
  try {

    // ====================================================
    // VERIFY TOKEN
    // ====================================================

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as {
      userId: string;
      email: string;
      role: string;
    };



    // ====================================================
    // GENERATE NEW TOKENS
    // ====================================================

    const newAccessToken =
      generateAccessToken({
        userId: payload.userId,

        email: payload.email,

        role: payload.role,
      });

    const newRefreshToken =
      generateRefreshToken({
        userId: payload.userId,

        email: payload.email,

        role: payload.role,
      });



    // ====================================================
    // RESPONSE
    // ====================================================

    return {
      accessToken:
        newAccessToken,

      refreshToken:
        newRefreshToken,
    };

  } catch {

    throw new Error(
      'INVALID_REFRESH_TOKEN'
    );
  }
}