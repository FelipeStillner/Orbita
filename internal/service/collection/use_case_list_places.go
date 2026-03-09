package collection

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) ListPlaces(ctx context.Context, collectionID uuid.UUID) ([]database.ListPlacesInCollectionRow, error) {
	return s.queries.ListPlacesInCollection(ctx, collectionID)
}
