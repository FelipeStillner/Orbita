-- name: ListPlaces :many
SELECT
    p.id,
    p.name,
    p.category,
    p.description,
    ST_Y(p.location::geometry)::float AS latitude,
    ST_X(p.location::geometry)::float AS longitude,
    COALESCE(upi.liked, FALSE) AS liked
FROM place p
LEFT JOIN user_place_interactions upi ON p.id = upi.place_id AND upi.user_id = @user_id::uuid
WHERE ST_DWithin(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography,
    @radius_meters::float
) AND COALESCE(upi.hidden, FALSE) = FALSE
ORDER BY ST_Distance(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography
) ASC
LIMIT $1 OFFSET $2;

-- name: ListPlaceImagesByPlaceIDs :many
SELECT place_id, url, description, is_primary
FROM place_image
WHERE place_id = ANY(@place_ids::uuid[])
ORDER BY place_id, is_primary DESC;

-- name: CreatePlacesBatch :many
INSERT INTO place (name, description, category, location)
SELECT
    unnest(@names::text[]),
    unnest(@descriptions::text[]),
    unnest(@categories::text[]),
    ST_SetSRID(ST_MakePoint(unnest(@longs::float8[]), unnest(@lats::float8[])), 4326)
RETURNING id;

-- name: AddPlaceImagesBatch :exec
INSERT INTO place_image (place_id, url, description, is_primary)
SELECT
    unnest(@place_ids::uuid[]),
    unnest(@urls::text[]),
    unnest(@descriptions::text[]),
    unnest(@is_primaries::boolean[]);
