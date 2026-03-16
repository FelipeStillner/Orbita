package place

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/service/place/helpers"
	"github.com/FelipeStillner/Orbita/internal/service/place/types"
)

func (s *Service) SearchPlaces(ctx context.Context, lat, lon float64, sizeMeters int) ([]types.Place, error) {
	bbox := helpers.GetBoundingBox(lat, lon, sizeMeters)
	return s.osm.FetchPlaces(bbox.S, bbox.W, bbox.N, bbox.E)
}
