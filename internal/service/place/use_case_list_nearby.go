package place

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
)

func (s *Service) ListNearby(ctx context.Context, lat, long float64) ([]Result, error) {
	rows, err := s.queries.GetNearbyPlaces(ctx, database.GetNearbyPlacesParams{
		Lat:          lat,
		Lon:          long,
		RadiusMeters: 5000,
	})
	if err != nil {
		return nil, err
	}

	results := make([]Result, len(rows))
	for i, row := range rows {
		results[i] = Result{
			ID:      row.ID,
			Name:    row.Name,
			GeoJSON: row.Geojson,
			Images:  row.Images,
		}
	}
	return results, nil
}
