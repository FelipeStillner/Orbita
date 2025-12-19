-- name: CreatePlace :one
INSERT INTO place (name, description, category, location)
VALUES (
    $1, $2, $3,
    ST_SetSRID(ST_MakePoint($4::float, $5::float), 4326)
)
RETURNING id;

-- name: AddPlaceImage :exec
INSERT INTO place_image (place_id, url, description, is_primary)
VALUES ($1, $2, $3, $4);

-- name: GetNearbyPlaces :many
SELECT
    p.id,
    p.name,
    p.category,
    p.description,
    ST_AsGeoJSON(p.location)::json AS geojson,
    -- The Magic: Aggregate all images into a JSON array automatically
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
LIMIT 50;
