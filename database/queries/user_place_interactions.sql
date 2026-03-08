-- name: UpsertUserPlaceInteraction :exec
INSERT INTO user_place_interactions (
    user_id,
    place_id,
    liked,
    hidden,
    last_interaction_at,
    created_at,
    updated_at
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    NOW(),
    NOW()
)
ON CONFLICT (user_id, place_id) DO UPDATE
SET liked = EXCLUDED.liked,
    hidden = EXCLUDED.hidden,
    last_interaction_at = NOW(),
    updated_at = NOW();

