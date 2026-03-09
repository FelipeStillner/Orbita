package collection

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) ListByUserWithPlaceCount(ctx context.Context, userID uuid.UUID) ([]database.ListCollectionsByUserWithPlaceCountRow, error) {
	return s.queries.ListCollectionsByUserWithPlaceCount(ctx, userID)
}
