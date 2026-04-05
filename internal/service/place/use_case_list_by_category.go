package place

import (
	"context"
	"encoding/json"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/internal/shared/timex"
	"github.com/FelipeStillner/Orbita/internal/service/place/types"
	"github.com/google/uuid"
)

func (s *Service) ListPlaces(ctx context.Context, userID uuid.UUID, lat, long float64, category string) ([]types.Result, error) {
	rows, err := s.queries.ListPlacesByCategory(ctx, database.ListPlacesByCategoryParams{
		UserID:       userID,
		Lon:          long,
		Lat:          lat,
		RadiusMeters: 3000.0,
		Category:     category,
	})
	if err != nil {
		return nil, err
	}

	placeIDs := make([]uuid.UUID, len(rows))
	for i, row := range rows {
		placeIDs[i] = row.ID
	}

	var imagesByPlace map[uuid.UUID][]types.PlaceImage
	if len(placeIDs) > 0 {
		imageRows, err := s.queries.ListPlaceImagesByPlaceIDs(ctx, placeIDs)
		if err != nil {
			return nil, err
		}
		imagesByPlace = make(map[uuid.UUID][]types.PlaceImage)
		for _, r := range imageRows {
			imagesByPlace[r.PlaceID] = append(imagesByPlace[r.PlaceID], types.PlaceImage{
				URL:         r.Url,
				Description: r.Description.String,
				IsPrimary:   r.IsPrimary.Bool,
			})
		}
	}

	var collectionsByPlace map[uuid.UUID][]types.CollectionItem
	if len(placeIDs) > 0 {
		collectionRows, err := s.queries.ListCollectionItemsByPlaceIDs(ctx, database.ListCollectionItemsByPlaceIDsParams{
			UserID:   userID,
			PlaceIds: placeIDs,
		})
		if err != nil {
			return nil, err
		}
		collectionsByPlace = make(map[uuid.UUID][]types.CollectionItem)
		for _, r := range collectionRows {
			collectionsByPlace[r.PlaceID] = append(collectionsByPlace[r.PlaceID], types.CollectionItem{
				ID:   r.CollectionID,
				Name: r.Name,
			})
		}
	}

	results := make([]types.Result, len(rows))
	for i, row := range rows {
		var images []types.PlaceImage
		if imagesByPlace != nil {
			images = imagesByPlace[row.ID]
		}
		var collections []types.CollectionItem
		if collectionsByPlace != nil {
			collections = collectionsByPlace[row.ID]
		}
		var tags []string
		if row.Tags.Valid {
			_ = json.Unmarshal(row.Tags.RawMessage, &tags)
		}
		dm := row.DistanceMeters
		var isOpen *bool
		if row.OpeningHours.Valid {
			isOpen = timex.IsOpenNow(row.OpeningHours.String, venueTimeLocation())
		}
		results[i] = types.Result{
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
			DistanceMeters: &dm,
			IsOpenNow:      isOpen,
		}
	}
	return results, nil
}
