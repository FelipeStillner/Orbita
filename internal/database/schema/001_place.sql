-- Extensions
-- 1. PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tables
CREATE TABLE IF NOT EXISTS place (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    category    TEXT NOT NULL,
    location    GEOMETRY(POINT, 4326) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS place_image (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id    UUID NOT NULL REFERENCES place(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    description TEXT,
    is_primary  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
-- 1. Spatial Index
CREATE INDEX IF NOT EXISTS idx_place_location ON place USING GIST (location);
-- 2. Index for place_images table
CREATE INDEX IF NOT EXISTS idx_place_image_place_id ON place_image(place_id);
