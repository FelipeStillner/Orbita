-- name: ListPlaces :many
SELECT
    p.id,
    p.name,
    p.category,
    p.description,
    ST_AsGeoJSON(p.location)::json AS geojson,
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
WHERE ST_DWithin(
    p.location,
    ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326),
    @radius_meters::float
)
GROUP BY p.id
ORDER BY p.id
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
