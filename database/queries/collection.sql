-- name: GetCollection :one
SELECT id, user_id, name, created_at, updated_at
FROM collections
WHERE id = $1;

-- name: ListCollectionsByUser :many
SELECT id, user_id, name, created_at, updated_at
FROM collections
WHERE user_id = $1
ORDER BY name ASC;

-- name: ListCollectionsByUserWithPlaceCount :many
SELECT c.id, c.name, COUNT(cp.place_id)::int AS place_count
FROM collections c
LEFT JOIN collection_place cp ON cp.collection_id = c.id
WHERE c.user_id = $1
GROUP BY c.id, c.name
ORDER BY c.name ASC;

-- name: ListPlacesInCollection :many
SELECT p.id, p.name
FROM place p
INNER JOIN collection_place cp ON cp.place_id = p.id
WHERE cp.collection_id = $1
ORDER BY p.name ASC;

-- name: CreateCollection :one
INSERT INTO collections (user_id, name)
VALUES ($1, $2)
RETURNING id, user_id, name, created_at, updated_at;

-- name: DeleteCollection :exec
DELETE FROM collections
WHERE id = $1;

-- name: AddPlaceToCollection :exec
INSERT INTO collection_place (collection_id, place_id)
VALUES ($1, $2)
ON CONFLICT (collection_id, place_id) DO NOTHING;

-- name: RemovePlaceFromCollection :exec
DELETE FROM collection_place
WHERE collection_id = $1 AND place_id = $2;

-- name: ListCollectionsForPlace :many
SELECT c.id, c.user_id, c.name, c.created_at, c.updated_at
FROM collections c
INNER JOIN collection_place cp ON cp.collection_id = c.id
WHERE c.user_id = $1 AND cp.place_id = $2
ORDER BY c.name ASC;

-- name: ListCollectionItemsByPlaceIDs :many
SELECT cp.place_id, c.id AS collection_id, c.name
FROM collection_place cp
INNER JOIN collections c ON c.id = cp.collection_id
WHERE c.user_id = @user_id::uuid AND cp.place_id = ANY(@place_ids::uuid[])
ORDER BY cp.place_id, c.name;
