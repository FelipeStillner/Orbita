-- name: IsAreaScanned :one
SELECT EXISTS (
    SELECT 1 FROM searched_locations
    WHERE (
        6371 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS($1 - lat) / 2), 2) +
            COS(RADIANS($1)) * COS(RADIANS(lat)) *
            POWER(SIN(RADIANS($2 - long) / 2), 2)
        ))
    ) <= 2.0
);

-- name: LogScan :exec
INSERT INTO searched_locations (lat, long, radius_km) VALUES ($1, $2, $3);
