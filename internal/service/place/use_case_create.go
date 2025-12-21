package place

import (
	"context"
	"database/sql"
	"fmt"
	"path/filepath"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/internal/storage"

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
		newFilename := "places/" + uuid.New().String() + ext

		publicURL, err := storage.UploadToGCS(img.Data, newFilename)
		if err != nil {
			fmt.Printf("Failed to upload image: %v\n", err)
			continue
		}

		s.queries.AddPlaceImage(ctx, database.AddPlaceImageParams{
			PlaceID:     id,
			Url:         publicURL,
			Description: sql.NullString{String: "Uploaded", Valid: true},
			IsPrimary:   sql.NullBool{Bool: false, Valid: true},
		})
	}

	return id, nil
}
