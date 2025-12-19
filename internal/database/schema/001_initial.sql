-- internal/database/schema/001_initial.sql

-- Extensions
-- 1. PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tables
CREATE TABLE places (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    category    TEXT NOT NULL,
    location    GEOMETRY(POINT, 4326) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
-- 1. Spatial Index (Crucial for speed)
CREATE INDEX idx_places_location ON places USING GIST (location);
