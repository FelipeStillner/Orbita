package collection

import (
	"context"

	"github.com/google/uuid"
)

func (s *Service) Delete(ctx context.Context, collectionID, userID uuid.UUID) error {
	col, err := s.queries.GetCollection(ctx, collectionID)
	if err != nil {
		return ErrNotFound
	}
	if col.UserID != userID {
		return ErrNotFound
	}
	return s.queries.DeleteCollection(ctx, collectionID)
}
