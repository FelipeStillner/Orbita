-- name: GetUserByGoogleID :one
SELECT
    id,
    google_id,
    name,
    email,
    picture,
    created_at,
    updated_at
FROM users
WHERE google_id = $1
LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (google_id, name, email, picture)
VALUES ($1, $2, $3, $4)
RETURNING
    id,
    google_id,
    name,
    email,
    picture,
    created_at,
    updated_at;

