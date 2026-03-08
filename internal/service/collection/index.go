package collection

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

type Service struct {
	queries *database.Queries
}

func NewService(q *database.Queries) *Service {
	return &Service{queries: q}
}

func (s *Service) ListByUser(ctx context.Context, userID uuid.UUID) ([]database.Collection, error) {
	return s.queries.ListCollectionsByUser(ctx, userID)
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, name string) (database.Collection, error) {
	return s.queries.CreateCollection(ctx, database.CreateCollectionParams{
		UserID: userID,
		Name:   name,
	})
}

func (s *Service) AddPlace(ctx context.Context, collectionID, placeID uuid.UUID) error {
	return s.queries.AddPlaceToCollection(ctx, database.AddPlaceToCollectionParams{
		CollectionID: collectionID,
		PlaceID:      placeID,
	})
}

func (s *Service) RemovePlace(ctx context.Context, collectionID, placeID uuid.UUID) error {
	return s.queries.RemovePlaceFromCollection(ctx, database.RemovePlaceFromCollectionParams{
		CollectionID: collectionID,
		PlaceID:      placeID,
	})
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (database.Collection, error) {
	return s.queries.GetCollection(ctx, id)
}
