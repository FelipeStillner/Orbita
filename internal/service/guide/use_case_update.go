package guide

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

type PatchInput struct {
	Title    *string
	Blurb    *string
	CoverURL *string
	Tags     *[]string
}

func (s *Service) Update(ctx context.Context, userID, guideID uuid.UUID, patch PatchInput) (database.Guide, error) {
	cur, err := s.queries.GetGuide(ctx, database.GetGuideParams{
		ID:     guideID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return database.Guide{}, ErrNotFound
		}
		return database.Guide{}, err
	}

	title := cur.Title
	if patch.Title != nil {
		title = *patch.Title
	}
	blurb := ""
	if cur.Blurb.Valid {
		blurb = cur.Blurb.String
	}
	if patch.Blurb != nil {
		blurb = *patch.Blurb
	}
	cover := ""
	if cur.CoverUrl.Valid {
		cover = cur.CoverUrl.String
	}
	if patch.CoverURL != nil {
		cover = *patch.CoverURL
	}
	tags := cur.Tags
	if patch.Tags != nil {
		b, err := json.Marshal(*patch.Tags)
		if err != nil {
			return database.Guide{}, err
		}
		if len(b) == 0 || string(b) == "null" {
			b = []byte("[]")
		}
		tags = b
	}

	return s.queries.UpdateGuide(ctx, database.UpdateGuideParams{
		Title:    title,
		Blurb:    blurb,
		CoverUrl: cover,
		Tags:     tags,
		ID:       guideID,
		UserID:   userID,
	})
}
