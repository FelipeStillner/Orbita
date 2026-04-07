-- Replace collections with guides (fresh migration)
DROP TABLE IF EXISTS collection_place;
DROP TABLE IF EXISTS collections;

CREATE TABLE IF NOT EXISTS guide (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    blurb       TEXT,
    cover_url   TEXT,
    tags        JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guide_step (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id    UUID NOT NULL REFERENCES guide(id) ON DELETE CASCADE,
    position    INT NOT NULL,
    step_title  TEXT NOT NULL DEFAULT '',
    step_note   TEXT,
    UNIQUE (guide_id, position)
);

CREATE INDEX IF NOT EXISTS idx_guide_step_guide_id ON guide_step (guide_id);

CREATE TABLE IF NOT EXISTS guide_step_place (
    guide_step_id UUID NOT NULL REFERENCES guide_step(id) ON DELETE CASCADE,
    place_id      UUID NOT NULL REFERENCES place(id) ON DELETE CASCADE,
    position      INT NOT NULL,
    option_note   TEXT,
    PRIMARY KEY (guide_step_id, place_id)
);

CREATE INDEX IF NOT EXISTS idx_guide_step_place_place_id ON guide_step_place (place_id);
