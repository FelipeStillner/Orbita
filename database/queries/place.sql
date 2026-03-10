-- name: ListPlaces :many
-- Heuristic personalized ranking: prefer places that match user's liked/saved by category and by tags (type/similarity).
WITH user_places AS (
    SELECT p2.id, p2.category, p2.tags
    FROM place p2
    JOIN user_place_interactions upi ON p2.id = upi.place_id AND upi.user_id = @user_id::uuid AND upi.liked = true
    UNION ALL
    SELECT p2.id, p2.category, p2.tags
    FROM place p2
    JOIN collection_place cp ON p2.id = cp.place_id
    JOIN collections c ON c.id = cp.collection_id AND c.user_id = @user_id::uuid
),
user_preferred_categories AS (
    SELECT DISTINCT category FROM user_places
),
user_preferred_tags AS (
    SELECT t.tag, COUNT(*)::int AS weight
    FROM user_places
    CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(user_places.tags, '[]'::jsonb)) AS t(tag)
    WHERE t.tag <> ''
    GROUP BY t.tag
)
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
    (CASE WHEN EXISTS (SELECT 1 FROM user_preferred_categories upc WHERE upc.category = p.category) THEN 1 ELSE 0 END)::int AS category_match,
    COALESCE((
        SELECT SUM(upt.weight)::float
        FROM user_preferred_tags upt
        WHERE upt.tag IN (SELECT jsonb_array_elements_text(COALESCE(p.tags, '[]'::jsonb)))
    ), 0)::float AS tag_match_score
FROM place p
LEFT JOIN user_place_interactions upi ON p.id = upi.place_id AND upi.user_id = @user_id::uuid
WHERE ST_DWithin(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography,
    @radius_meters::float
) AND COALESCE(upi.hidden, FALSE) = FALSE
ORDER BY (
    ST_Distance(
        p.location::geography,
        ST_SetSRID(ST_MakePoint(@lon::float, @lat::float), 4326)::geography
    ) / (1.0
        + 0.2 * (CASE WHEN EXISTS (SELECT 1 FROM user_preferred_categories upc WHERE upc.category = p.category) THEN 1 ELSE 0 END)::float
        + 0.4 * LEAST(1.0, COALESCE((
            SELECT SUM(upt.weight)::float
            FROM user_preferred_tags upt
            WHERE upt.tag IN (SELECT jsonb_array_elements_text(COALESCE(p.tags, '[]'::jsonb)))
        ), 0) / 5.0))
) ASC
LIMIT $1 OFFSET $2;

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
