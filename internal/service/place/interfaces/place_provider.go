package interfaces

import "github.com/FelipeStillner/Orbita/internal/service/place/types"

type PlaceProvider interface {
	FetchPlaces(lat, long float64, radiusMeters int) ([]types.Place, error)
}
