CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  first_name TEXT,
  last_name TEXT,

  avatar_url TEXT,

  phone TEXT,
  location TEXT,

  bio TEXT,

  dni TEXT,
  birth_date DATE,
  nationality TEXT,
  cuit_cuil TEXT,
  address TEXT,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);