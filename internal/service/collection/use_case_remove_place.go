package collection

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) RemovePlace(ctx context.Context, collectionID, placeID uuid.UUID) error {
	return s.queries.RemovePlaceFromCollection(ctx, database.RemovePlaceFromCollectionParams{
		CollectionID: collectionID,
		PlaceID:      placeID,
	})
}
