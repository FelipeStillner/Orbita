CREATE TABLE searched_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lat DOUBLE PRECISION NOT NULL,
    long DOUBLE PRECISION NOT NULL,
    radius_km DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Simple index to make lookups fast
CREATE INDEX idx_searched_locations_lat_long ON searched_locations(lat, long);
