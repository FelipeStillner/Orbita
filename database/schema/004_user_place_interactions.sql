CREATE TABLE IF NOT EXISTS user_place_interactions (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES place(id) ON DELETE CASCADE,
    rating INT NOT NULL DEFAULT 0,
    visited BOOLEAN NOT NULL DEFAULT FALSE,
    saved BOOLEAN NOT NULL DEFAULT FALSE,
    times_recommended INT NOT NULL DEFAULT 0,
    last_recommended_at TIMESTAMPTZ,
    last_interaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, place_id)
);

CREATE INDEX IF NOT EXISTS idx_user_place_interactions_place_id
    ON user_place_interactions(place_id);

