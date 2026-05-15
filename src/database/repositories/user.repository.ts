import { db } from '@/database/client';

import type {
  User,
} from '@/database/types/users';



// ========================================================
// DATABASE USER ROW
// ========================================================

type UserRow = {
  id: string;

  first_name: string;

  last_name: string;

  email: string;

  phone: string | null;

  password_hash: string;

  avatar_url: string | null;

  is_verified: boolean;

  is_active: boolean;

  role: string;

  created_at: string;

  updated_at: string;

  bio?: string | null;
};



// ========================================================
// MAPPER
// ========================================================

function mapUserRowToUser(
  row: UserRow
): User {
  return {
    id: row.id,

    firstName:
      row.first_name,

    lastName:
      row.last_name,

    email: row.email,

    phone: row.phone,

    avatarUrl:
      row.avatar_url,

    bio: row.bio ?? null,

    role: row.role as User['role'],

    status: row.is_active
      ? 'ACTIVE'
      : 'INACTIVE',

    isVerified:
      row.is_verified,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}



// ========================================================
// CREATE USER
// ========================================================

export async function createUser(
  input: {
    firstName: string;

    lastName: string;

    email: string;

    passwordHash: string;

    role:
    | 'OWNER'
    | 'AGENT';

  }
): Promise<User> {
  const result =
    await db.query<UserRow>(
      `
        INSERT INTO users (
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
          $5
        )
        RETURNING *
      `,
      [
        input.firstName,

        input.lastName,

        input.email,

        input.passwordHash,

        input.role,
      ]
    );

  return mapUserRowToUser(
    result.rows[0]
  );
}



// ========================================================
// FIND USER BY EMAIL
// ========================================================

function readPasswordHashFromRow(
  row: UserRow
): string | undefined {
  const raw =
    row as unknown as Record<
      string,
      unknown
    >;

  const snake =
    raw.password_hash;

  if (
    typeof snake ===
      'string' &&
    snake.length > 0
  ) {
    return snake;
  }

  const camel =
    raw.passwordHash;

  if (
    typeof camel ===
      'string' &&
    camel.length > 0
  ) {
    return camel;
  }

  return undefined;
}

export async function findUserByEmail(
  email: string
): Promise<
  (User & {
    passwordHash: string;
  }) | null
> {
  const result =
    await db.query<UserRow>(
      `
        SELECT *
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

  if (
    result.rows.length === 0
  ) {
    return null;
  }

  const row = result.rows[0];

  const passwordHash =
    readPasswordHashFromRow(
      row
    );

  if (
    passwordHash == null
  ) {
    return null;
  }

  return {
    ...mapUserRowToUser(row),

    passwordHash,
  };
}



// ========================================================
// FIND USER BY ID
// ========================================================

export async function findUserById(
  id: string
): Promise<User | null> {
  const result =
    await db.query<UserRow>(
      `
        SELECT *
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

  if (
    result.rows.length === 0
  ) {
    return null;
  }

  return mapUserRowToUser(
    result.rows[0]
  );
}



// ========================================================
// VERIFY USER EMAIL
// ========================================================

export async function verifyUserEmail(
  userId: string
): Promise<void> {
  await db.query(
    `
      UPDATE users
      SET
        is_verified = true,
        updated_at = now()
      WHERE id = $1
    `,
    [userId]
  );
}



// ========================================================
// UPDATE USER PROFILE
// ========================================================

export async function updateUserProfile(
  userId: string,
  input: {
    firstName?: string;

    lastName?: string;

    phone?: string | null;

    avatarUrl?: string | null;

    bio?: string | null;
  }
): Promise<User | null> {
  const result =
    await db.query<UserRow>(
      `
        UPDATE users
        SET
          first_name = COALESCE(
            $2,
            first_name
          ),

          last_name = COALESCE(
            $3,
            last_name
          ),

          phone = COALESCE(
            $4,
            phone
          ),

          avatar_url = COALESCE(
            $5,
            avatar_url
          ),

          bio = COALESCE(
            $6,
            bio
          ),

          updated_at = now()

        WHERE id = $1

        RETURNING *
      `,
      [
        userId,

        input.firstName,

        input.lastName,

        input.phone,

        input.avatarUrl,

        input.bio,
      ]
    );

  if (
    result.rows.length === 0
  ) {
    return null;
  }

  return mapUserRowToUser(
    result.rows[0]
  );
}