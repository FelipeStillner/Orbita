package place

import (
	"context"
	"database/sql"
	"io"
	"os"
	"path/filepath"

	"github.com/FelipeStillner/Orbita/internal/database"

	"github.com/google/uuid"
)

func (s *Service) Create(ctx context.Context, params CreateParams) (uuid.UUID, error) {
	id, err := s.queries.CreatePlace(ctx, database.CreatePlaceParams{
		Name:        params.Name,
		Description: sql.NullString{String: params.Description, Valid: true},
		Category:    params.Category,
		Column4:     params.Long,
		Column5:     params.Lat,
	})
	if err != nil {
		return uuid.Nil, err
	}

	for _, img := range params.Images {
		ext := filepath.Ext(img.Filename)
		newFilename := uuid.New().String() + ext
		savePath := filepath.Join("uploads", newFilename)

		dst, err := os.Create(savePath)
		if err != nil {
			continue
		}

		io.Copy(dst, img.Data)
		dst.Close()

		s.queries.AddPlaceImage(ctx, database.AddPlaceImageParams{
			PlaceID:     id,
			Url:         "/uploads/" + newFilename,
			Description: sql.NullString{String: "Uploaded", Valid: true},
			IsPrimary:   sql.NullBool{Bool: false, Valid: true},
		})
	}

	return id, nil
}
