package guide

import (
	"context"
	"encoding/json"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

type CreateInput struct {
	Title    string
	Blurb    string
	CoverURL string
	Tags     []string
}

func (s *Service) Create(ctx context.Context, userID uuid.UUID, in CreateInput) (database.Guide, error) {
	tagsJSON, err := json.Marshal(in.Tags)
	if err != nil {
		return database.Guide{}, err
	}
	if len(tagsJSON) == 0 || string(tagsJSON) == "null" {
		tagsJSON = []byte("[]")
	}
	return s.queries.CreateGuide(ctx, database.CreateGuideParams{
		UserID:   userID,
		Title:    in.Title,
		Blurb:    in.Blurb,
		CoverUrl: in.CoverURL,
		Tags:     tagsJSON,
	})
}
