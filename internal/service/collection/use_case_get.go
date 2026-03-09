package collection

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (database.Collection, error) {
	return s.queries.GetCollection(ctx, id)
}
