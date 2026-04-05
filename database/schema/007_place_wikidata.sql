-- Dedupe OSM search imports by Wikidata Q-id.
ALTER TABLE place
ADD COLUMN IF NOT EXISTS wikidata_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_place_wikidata_id_unique ON place (wikidata_id);
