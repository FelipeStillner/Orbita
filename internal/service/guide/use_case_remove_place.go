package guide

import (
	"context"
	"database/sql"
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) RemovePlace(ctx context.Context, userID, guideID, placeID uuid.UUID) error {
	_, err := s.queries.GetGuide(ctx, database.GetGuideParams{
		ID:     guideID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	if err := s.queries.RemovePlaceFromGuideEverywhere(ctx, database.RemovePlaceFromGuideEverywhereParams{
		GuideID: guideID,
		PlaceID: placeID,
	}); err != nil {
		return err
	}
	return s.queries.DeleteEmptyStepsInGuide(ctx, guideID)
}
