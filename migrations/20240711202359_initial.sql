-- +goose Up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  updated_at DATE,
  created_at DATE NOT NULL DEFAULT NOW()
);

CREATE TYPE task_status AS ENUM ('done', 'in_progress', 'to_do');
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID,
    description TEXT NOT NULL,
    status task_status NOT NULL DEFAULT 'to_do',
    updated_at DATE,
    created_at DATE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS task_status;
