-- name: ListPlaces :many
SELECT
    p.id,
    p.name,
    p.category,
    p.description,
    ST_Y(p.location::geometry)::float AS latitude,
    ST_X(p.location::geometry)::float AS longitude,
    COALESCE(upi.liked, FALSE) AS liked,
    COALESCE(
        json_agg(
            json_build_object(
                'url', i.url,
                'description', i.description,
                'is_primary', i.is_primary
            )
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'
    )::json AS images
FROM place p
LEFT JOIN place_image i ON p.id = i.place_id
LEFT JOIN user_place_interactions upi ON p.id = upi.place_id AND upi.user_id = @user_id::uuid
WHERE ST_DWithin(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography,
    @radius_meters::float
) AND COALESCE(upi.hidden, FALSE) = FALSE
GROUP BY p.id, upi.liked, upi.hidden
ORDER BY ST_Distance(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography
) ASC
LIMIT $1 OFFSET $2;

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
