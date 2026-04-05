package place

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/internal/service/place/types"
	"github.com/FelipeStillner/Orbita/internal/shared/geox"
	"github.com/FelipeStillner/Orbita/internal/shared/timex"
	"github.com/google/uuid"
)

var ErrNotFound = errors.New("place not found")

func (s *Service) GetByID(ctx context.Context, userID, placeID uuid.UUID, viewerLat, viewerLon *float64) (*types.Result, error) {
	row, err := s.queries.GetPlaceByID(ctx, database.GetPlaceByIDParams{
		UserID:  userID,
		PlaceID: placeID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	placeIDs := []uuid.UUID{placeID}

	imageRows, err := s.queries.ListPlaceImagesByPlaceIDs(ctx, placeIDs)
	if err != nil {
		return nil, err
	}
	images := make([]types.PlaceImage, 0, len(imageRows))
	for _, r := range imageRows {
		images = append(images, types.PlaceImage{
			URL:         r.Url,
			Description: r.Description.String,
			IsPrimary:   r.IsPrimary.Bool,
		})
	}

	collectionRows, err := s.queries.ListCollectionItemsByPlaceIDs(ctx, database.ListCollectionItemsByPlaceIDsParams{
		UserID:   userID,
		PlaceIds: placeIDs,
	})
	if err != nil {
		return nil, err
	}
	collections := make([]types.CollectionItem, 0, len(collectionRows))
	for _, r := range collectionRows {
		collections = append(collections, types.CollectionItem{
			ID:   r.CollectionID,
			Name: r.Name,
		})
	}

	var tags []string
	if row.Tags.Valid {
		_ = json.Unmarshal(row.Tags.RawMessage, &tags)
	}

	var isOpen *bool
	if row.OpeningHours.Valid {
		isOpen = timex.IsOpenNow(row.OpeningHours.String, venueTimeLocation())
	}

	var dist *float64
	if viewerLat != nil && viewerLon != nil {
		d := geox.HaversineMeters(*viewerLat, *viewerLon, row.Latitude, row.Longitude)
		dist = &d
	}

	return &types.Result{
		ID:             row.ID,
		Name:           row.Name,
		Latitude:       row.Latitude,
		Longitude:      row.Longitude,
		Images:         images,
		Description:    row.Description.String,
		Category:       row.Category,
		Liked:          row.Liked,
		Collections:    collections,
		Tags:           tags,
		OpeningHours:   row.OpeningHours.String,
		LikeCount:      row.LikeCount,
		SaveCount:      row.SaveCount,
		HideCount:      row.HideCount,
		DistanceMeters: dist,
		IsOpenNow:      isOpen,
	}, nil
}
