package place

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) SetInteraction(ctx context.Context, userID, placeID uuid.UUID, liked, hidden bool) error {

	return s.queries.UpsertUserPlaceInteraction(ctx, database.UpsertUserPlaceInteractionParams{
		UserID:  userID,
		PlaceID: placeID,
		Liked:   liked,
		Hidden:  hidden,
	})
}
