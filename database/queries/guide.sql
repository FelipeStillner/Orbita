-- name: GetGuide :one
SELECT id, user_id, title, blurb, cover_url, tags, created_at, updated_at
FROM guide
WHERE id = @id::uuid AND user_id = @user_id::uuid;

-- name: ListGuidesByUserWithCounts :many
SELECT
    g.id,
    g.title,
    (SELECT COUNT(*)::int FROM guide_step gs WHERE gs.guide_id = g.id) AS step_count,
    (SELECT COUNT(*)::int
     FROM guide_step gs
     INNER JOIN guide_step_place gsp ON gsp.guide_step_id = gs.id
     WHERE gs.guide_id = g.id) AS place_count
FROM guide g
WHERE g.user_id = @user_id::uuid
ORDER BY g.updated_at DESC, g.title ASC;

-- name: CreateGuide :one
INSERT INTO guide (user_id, title, blurb, cover_url, tags)
VALUES (
    @user_id::uuid,
    @title::text,
    @blurb::text,
    @cover_url::text,
    COALESCE(@tags::jsonb, '[]'::jsonb)
)
RETURNING id, user_id, title, blurb, cover_url, tags, created_at, updated_at;

-- name: UpdateGuide :one
UPDATE guide
SET
    title = @title::text,
    blurb = @blurb::text,
    cover_url = @cover_url::text,
    tags = COALESCE(@tags::jsonb, tags),
    updated_at = NOW()
WHERE id = @id::uuid AND user_id = @user_id::uuid
RETURNING id, user_id, title, blurb, cover_url, tags, created_at, updated_at;

-- name: DeleteGuide :exec
DELETE FROM guide
WHERE id = @id::uuid AND user_id = @user_id::uuid;

-- name: ListGuideStepsByGuideID :many
SELECT id, guide_id, position, step_title, step_note
FROM guide_step
WHERE guide_id = @guide_id::uuid
ORDER BY position ASC;

-- name: MaxGuideStepPosition :one
SELECT COALESCE(MAX(position), -1)::int AS max_pos
FROM guide_step
WHERE guide_id = @guide_id::uuid;

-- name: CreateGuideStep :one
INSERT INTO guide_step (guide_id, position, step_title, step_note)
VALUES (@guide_id::uuid, @position::int, @step_title::text, @step_note::text)
RETURNING id, guide_id, position, step_title, step_note;

-- name: DeleteGuideStep :exec
DELETE FROM guide_step
WHERE id = @id::uuid AND guide_id = @guide_id::uuid;

-- name: CountPlacesInGuideStep :one
SELECT COUNT(*)::int
FROM guide_step_place
WHERE guide_step_id = @guide_step_id::uuid;

-- name: ListGuideStepPlacesWithPlace :many
SELECT
    gsp.guide_step_id,
    gsp.place_id,
    gsp.position,
    gsp.option_note,
    p.name AS place_name,
    ST_Y(p.location::geometry)::float AS latitude,
    ST_X(p.location::geometry)::float AS longitude,
    COALESCE(
        (
            SELECT pi.url
            FROM place_image pi
            WHERE pi.place_id = gsp.place_id
            ORDER BY pi.is_primary DESC NULLS LAST, pi.created_at ASC
            LIMIT 1
        ),
        ''
    )::text AS primary_image_url,
    COALESCE(
        (
            SELECT json_agg(pi.url ORDER BY pi.is_primary DESC NULLS LAST, pi.created_at ASC)
            FROM place_image pi
            WHERE pi.place_id = gsp.place_id
        )::text,
        '[]'::text
    ) AS image_urls,
    COALESCE(p.tags, '[]'::jsonb) AS tags,
    (SELECT COUNT(*)::int FROM place_image pi WHERE pi.place_id = gsp.place_id) AS photo_count,
    (SELECT COUNT(*)::int FROM user_place_interactions WHERE place_id = gsp.place_id AND liked = true) AS like_count,
    p.opening_hours
FROM guide_step_place gsp
INNER JOIN place p ON p.id = gsp.place_id
WHERE gsp.guide_step_id = ANY(@guide_step_ids::uuid[])
ORDER BY gsp.guide_step_id, gsp.position ASC;

-- name: AddPlaceToGuideStep :exec
INSERT INTO guide_step_place (guide_step_id, place_id, position, option_note)
VALUES (@guide_step_id::uuid, @place_id::uuid, @position::int, @option_note::text)
ON CONFLICT (guide_step_id, place_id) DO UPDATE SET
    option_note = EXCLUDED.option_note;

-- name: UpdateGuideStepContent :exec
UPDATE guide_step
SET step_title = @step_title::text,
    step_note = @step_note::text
WHERE id = @step_id::uuid AND guide_id = @guide_id::uuid;

-- name: UpdateGuideStepPlaceOptionNote :exec
UPDATE guide_step_place
SET option_note = @option_note::text
WHERE guide_step_id = @guide_step_id::uuid AND place_id = @place_id::uuid;

-- name: RemovePlaceFromGuideStep :exec
DELETE FROM guide_step_place
WHERE guide_step_id = @guide_step_id::uuid AND place_id = @place_id::uuid;

-- name: ListGuideItemsByPlaceIDs :many
SELECT
    gsp.place_id,
    g.id AS guide_id,
    g.title AS guide_name
FROM guide_step_place gsp
INNER JOIN guide_step gs ON gs.id = gsp.guide_step_id
INNER JOIN guide g ON g.id = gs.guide_id
WHERE g.user_id = @user_id::uuid
  AND gsp.place_id = ANY(@place_ids::uuid[])
ORDER BY gsp.place_id, g.title;

-- name: CountPlaceInGuide :one
SELECT COUNT(*)::int
FROM guide_step_place gsp
INNER JOIN guide_step gs ON gs.id = gsp.guide_step_id
WHERE gs.guide_id = @guide_id::uuid AND gsp.place_id = @place_id::uuid;

-- name: MaxPlacePositionInStep :one
SELECT COALESCE(MAX(position), -1)::int AS max_pos
FROM guide_step_place
WHERE guide_step_id = @guide_step_id::uuid;

-- name: RemovePlaceFromGuideEverywhere :exec
DELETE FROM guide_step_place AS gsp
USING guide_step AS gs
WHERE gsp.guide_step_id = gs.id
  AND gs.guide_id = @guide_id::uuid
  AND gsp.place_id = @place_id::uuid;

-- name: DeleteEmptyStepsInGuide :exec
DELETE FROM guide_step AS gs
WHERE gs.guide_id = @guide_id::uuid
  AND NOT EXISTS (
    SELECT 1 FROM guide_step_place gsp WHERE gsp.guide_step_id = gs.id
  );
