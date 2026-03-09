package collection

import (
	"context"
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

var ErrNotFound = errors.New("collection not found")

type Service struct {
	queries *database.Queries
}

func NewService(q *database.Queries) *Service {
	return &Service{queries: q}
}

func (s *Service) ListByUserWithPlaceCount(ctx context.Context, userID uuid.UUID) ([]database.ListCollectionsByUserWithPlaceCountRow, error) {
	return s.queries.ListCollectionsByUserWithPlaceCount(ctx, userID)
}

func (s *Service) ListPlaces(ctx context.Context, collectionID uuid.UUID) ([]database.ListPlacesInCollectionRow, error) {
	return s.queries.ListPlacesInCollection(ctx, collectionID)
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
