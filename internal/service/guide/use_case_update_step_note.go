package guide

import (
	"context"
	"database/sql"
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

// UpdateStepContent updates step title and/or note. Nil pointers leave that field unchanged.
func (s *Service) UpdateStepContent(
	ctx context.Context,
	userID, guideID, stepID uuid.UUID,
	stepTitle *string,
	stepNote *string,
) error {
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
	var current *database.GuideStep
	for i := range steps {
		if steps[i].ID == stepID {
			current = &steps[i]
			break
		}
	}
	if current == nil {
		return ErrNotFound
	}

	title := current.StepTitle
	if stepTitle != nil {
		title = *stepTitle
	}
	note := ""
	if current.StepNote.Valid {
		note = current.StepNote.String
	}
	if stepNote != nil {
		note = *stepNote
	}

	return s.queries.UpdateGuideStepContent(ctx, database.UpdateGuideStepContentParams{
		StepTitle: title,
		StepNote:  note,
		StepID:    stepID,
		GuideID:   guideID,
	})
}
