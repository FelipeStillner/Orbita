package guide

import (
	"context"

	"github.com/google/uuid"
)

func (s *Service) ListByUser(ctx context.Context, userID uuid.UUID) ([]ListItem, error) {
	rows, err := s.queries.ListGuidesByUserWithCounts(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]ListItem, len(rows))
	for i, r := range rows {
		out[i] = ListItem{
			ID:         r.ID,
			Title:      r.Title,
			StepCount:  r.StepCount,
			PlaceCount: r.PlaceCount,
		}
	}
	return out, nil
}
