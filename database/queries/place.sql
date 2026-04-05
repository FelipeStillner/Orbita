-- name: ListNearbyPlaces :many
SELECT
    p.id,
    p.name,
    p.category,
    p.description,
    ST_Y(p.location::geometry)::float AS latitude,
    ST_X(p.location::geometry)::float AS longitude,
    COALESCE(upi.liked, FALSE) AS liked,
    COALESCE(p.tags, '[]'::jsonb) AS tags,
    p.opening_hours,
    (SELECT COUNT(*)::int FROM user_place_interactions WHERE place_id = p.id AND liked = true) AS like_count,
    (SELECT COUNT(*)::int FROM collection_place WHERE place_id = p.id) AS save_count,
    (SELECT COUNT(*)::int FROM user_place_interactions WHERE place_id = p.id AND hidden = true) AS hide_count,
    ST_Distance(
        p.location::geography,
        ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography
    )::float8 AS distance_meters
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
) ASC;

-- name: ListPlacesByCategory :many
SELECT
    p.id,
    p.name,
    p.category,
    p.description,
    ST_Y(p.location::geometry)::float AS latitude,
    ST_X(p.location::geometry)::float AS longitude,
    COALESCE(upi.liked, FALSE) AS liked,
    COALESCE(p.tags, '[]'::jsonb) AS tags,
    p.opening_hours,
    (SELECT COUNT(*)::int FROM user_place_interactions WHERE place_id = p.id AND liked = true) AS like_count,
    (SELECT COUNT(*)::int FROM collection_place WHERE place_id = p.id) AS save_count,
    (SELECT COUNT(*)::int FROM user_place_interactions WHERE place_id = p.id AND hidden = true) AS hide_count,
    ST_Distance(
        p.location::geography,
        ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography
    )::float8 AS distance_meters
FROM place p
LEFT JOIN user_place_interactions upi ON p.id = upi.place_id AND upi.user_id = @user_id::uuid
WHERE ST_DWithin(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography,
    @radius_meters::float
) AND COALESCE(upi.hidden, FALSE) = FALSE
AND p.category = @category
ORDER BY ST_Distance(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography
) ASC;

-- name: GetPlaceByID :one
SELECT
    p.id,
    p.name,
    p.category,
    p.description,
    ST_Y(p.location::geometry)::float AS latitude,
    ST_X(p.location::geometry)::float AS longitude,
    COALESCE(upi.liked, FALSE) AS liked,
    COALESCE(p.tags, '[]'::jsonb) AS tags,
    p.opening_hours,
    (SELECT COUNT(*)::int FROM user_place_interactions WHERE place_id = p.id AND liked = true) AS like_count,
    (SELECT COUNT(*)::int FROM collection_place WHERE place_id = p.id) AS save_count,
    (SELECT COUNT(*)::int FROM user_place_interactions WHERE place_id = p.id AND hidden = true) AS hide_count
FROM place p
LEFT JOIN user_place_interactions upi ON p.id = upi.place_id AND upi.user_id = @user_id::uuid
WHERE p.id = @place_id::uuid;

-- name: ListPlaceImagesByPlaceIDs :many
SELECT place_id, url, description, is_primary
FROM place_image
WHERE place_id = ANY(@place_ids::uuid[])
ORDER BY place_id, is_primary DESC;

-- name: CreatePlacesBatch :many
INSERT INTO place (name, description, category, location, tags, opening_hours)
SELECT
    unnest(@names::text[]),
    unnest(@descriptions::text[]),
    unnest(@categories::text[]),
    ST_SetSRID(ST_MakePoint(unnest(@longs::float8[]), unnest(@lats::float8[])), 4326),
    unnest(COALESCE(@tags::text[], ARRAY[]::text[]))::jsonb,
    unnest(COALESCE(@opening_hours_list::text[], ARRAY[]::text[]))
RETURNING id;

-- name: AddPlaceImagesBatch :exec
INSERT INTO place_image (place_id, url, description, is_primary)
SELECT
    unnest(@place_ids::uuid[]),
    unnest(@urls::text[]),
    unnest(@descriptions::text[]),
    unnest(@is_primaries::boolean[]);
