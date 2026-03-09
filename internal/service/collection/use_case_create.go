package collection

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) Create(ctx context.Context, userID uuid.UUID, name string) (database.Collection, error) {
	return s.queries.CreateCollection(ctx, database.CreateCollectionParams{
		UserID: userID,
		Name:   name,
	})
}
