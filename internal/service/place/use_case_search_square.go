package place

import (
	"context"
	"encoding/json"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/internal/service/place/helpers"
	"github.com/FelipeStillner/Orbita/internal/service/place/types"
	"github.com/google/uuid"
)

func (s *Service) SearchPlaces(ctx context.Context, lat, lon float64, sizeMeters int) ([]types.Place, error) {
	bbox := helpers.GetBoundingBox(lat, lon, sizeMeters)
	places, err := s.osm.FetchPlaces(bbox.S, bbox.W, bbox.N, bbox.E)
	if err != nil {
		return nil, err
	}
	return s.persistOSMPlaces(ctx, places)
}

func (s *Service) persistOSMPlaces(ctx context.Context, places []types.Place) ([]types.Place, error) {
	if len(places) == 0 {
		return places, nil
	}

	// One row per wikidata_id: duplicate Q-ids in one Overpass response break ON CONFLICT
	// ("cannot affect row a second time").
	seenWiki := make(map[string]struct{})
	var names, descriptions, categories, tagsJSON, openingHours, wikidataIDs []string
	var lats, longs []float64
	for _, p := range places {
		if p.WikidataID == "" {
			continue
		}
		if _, dup := seenWiki[p.WikidataID]; dup {
			continue
		}
		seenWiki[p.WikidataID] = struct{}{}

		names = append(names, p.Name)
		descriptions = append(descriptions, p.Description)
		categories = append(categories, p.Category)
		lats = append(lats, p.Lat)
		longs = append(longs, p.Long)
		b, err := json.Marshal(p.Tags)
		if err != nil {
			return nil, err
		}
		tagsJSON = append(tagsJSON, string(b))
		openingHours = append(openingHours, p.OpeningHours)
		wikidataIDs = append(wikidataIDs, p.WikidataID)
	}

	if len(names) == 0 {
		return places, nil
	}

	rows, err := s.queries.UpsertPlacesFromOSM(ctx, database.UpsertPlacesFromOSMParams{
		Names:            names,
		Descriptions:     descriptions,
		Categories:       categories,
		Lats:             lats,
		Longs:            longs,
		TagsJson:         tagsJSON,
		OpeningHoursList: openingHours,
		WikidataIds:      wikidataIDs,
	})
	if err != nil {
		return nil, err
	}

	if err := s.attachWikidataImagesAfterUpsert(ctx, rows); err != nil {
		return nil, err
	}

	idByWiki := make(map[string]uuid.UUID, len(rows))
	for _, row := range rows {
		if row.WikidataID.Valid {
			idByWiki[row.WikidataID.String] = row.ID
		}
	}

	out := make([]types.Place, len(places))
	for i, p := range places {
		out[i] = p
		if p.WikidataID != "" {
			if id, ok := idByWiki[p.WikidataID]; ok {
				out[i].ID = id
			}
		}
	}
	return out, nil
}
