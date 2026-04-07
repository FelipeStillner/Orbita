package guide

import (
	"context"
	"database/sql"
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) AddPlaceToStep(ctx context.Context, userID, guideID, stepID, placeID uuid.UUID, optionNote string) error {
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

	steps, err := s.queries.ListGuideStepsByGuideID(ctx, guideID)
	if err != nil {
		return err
	}
	var found bool
	for _, st := range steps {
		if st.ID == stepID {
			found = true
			break
		}
	}
	if !found {
		return ErrNotFound
	}

	maxPos, err := s.queries.MaxPlacePositionInStep(ctx, stepID)
	if err != nil {
		return err
	}
	next := maxPos + 1

	return s.queries.AddPlaceToGuideStep(ctx, database.AddPlaceToGuideStepParams{
		GuideStepID: stepID,
		PlaceID:     placeID,
		Position:    next,
		OptionNote:  optionNote,
	})
}
