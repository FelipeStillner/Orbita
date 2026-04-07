package guide

import (
	"context"
	"database/sql"
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) UpdatePlaceOptionNote(ctx context.Context, userID, guideID, stepID, placeID uuid.UUID, note string) error {
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
	return s.queries.UpdateGuideStepPlaceOptionNote(ctx, database.UpdateGuideStepPlaceOptionNoteParams{
		OptionNote:  note,
		GuideStepID: stepID,
		PlaceID:     placeID,
	})
}
