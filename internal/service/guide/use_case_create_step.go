package guide

import (
	"context"
	"database/sql"
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) CreateStep(ctx context.Context, userID, guideID uuid.UUID, stepTitle, stepNote string) (database.GuideStep, error) {
	_, err := s.queries.GetGuide(ctx, database.GetGuideParams{
		ID:     guideID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return database.GuideStep{}, ErrNotFound
		}
		return database.GuideStep{}, err
	}

	maxPos, err := s.queries.MaxGuideStepPosition(ctx, guideID)
	if err != nil {
		return database.GuideStep{}, err
	}
	nextPos := maxPos + 1

	return s.queries.CreateGuideStep(ctx, database.CreateGuideStepParams{
		GuideID:   guideID,
		Position:  nextPos,
		StepTitle: stepTitle,
		StepNote:  stepNote,
	})
}
