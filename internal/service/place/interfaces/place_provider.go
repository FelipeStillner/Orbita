package interfaces

import "github.com/FelipeStillner/Orbita/internal/service/place/types"

type PlaceProvider interface {
	FetchPlaces(latS, lonW, latN, lonE float64) ([]types.Place, error)
}
