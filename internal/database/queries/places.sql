-- internal/database/queries/places.sql

-- name: CreatePlace :one
INSERT INTO places (name, description, category, location)
VALUES (
    $1,
    $2,
    $3,
    ST_SetSRID(ST_MakePoint($4::float, $5::float), 4326) -- Convert Lat/Lon to Geometry
)
RETURNING id, name, category, created_at;

-- name: GetNearbyPlaces :many
SELECT
    id,
    name,
    category,
    description,
    ST_AsGeoJSON(location)::json AS geojson -- Return standard JSON directly!
FROM places
WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326),
    @radius_meters::float
)
LIMIT 50;
