package collection

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) AddPlace(ctx context.Context, collectionID, placeID uuid.UUID) error {
	return s.queries.AddPlaceToCollection(ctx, database.AddPlaceToCollectionParams{
		CollectionID: collectionID,
		PlaceID:      placeID,
	})
}
