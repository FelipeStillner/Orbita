-- name: IsAreaScanned :one
SELECT EXISTS (
    SELECT 1 FROM searched_locations
    WHERE lat BETWEEN $1 - 0.01 AND $1 + 0.01
    AND long BETWEEN $2 - 0.01 AND $2 + 0.01
);

-- name: LogScan :exec
INSERT INTO searched_locations (lat, long, radius_km) VALUES ($1, $2, $3);
