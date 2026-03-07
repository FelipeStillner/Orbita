package place

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) SetInteraction(ctx context.Context, userID, placeID uuid.UUID, rating int32, visited, saved bool) error {
	if rating > 1 {
		rating = 1
	} else if rating < -1 {
		rating = -1
	}

	return s.queries.UpsertUserPlaceInteraction(ctx, database.UpsertUserPlaceInteractionParams{
		UserID:  userID,
		PlaceID: placeID,
		Rating:  rating,
		Visited: visited,
		Saved:   saved,
	})
}
