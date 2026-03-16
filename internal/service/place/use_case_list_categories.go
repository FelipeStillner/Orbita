package place

import (
	"context"
	"encoding/json"
	"sort"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/internal/service/place/types"
	"github.com/google/uuid"
)

const placesPerCategory = 6
const radiusMeters = 3000.0

type CategoryPlaces struct {
	Category string
	Places   []types.Result
}

func (s *Service) ListCategories(ctx context.Context, userID uuid.UUID, lat, long float64) ([]CategoryPlaces, error) {
	rows, err := s.queries.ListNearbyPlaces(ctx, database.ListNearbyPlacesParams{
		UserID:       userID,
		Lon:          long,
		Lat:          lat,
		RadiusMeters: radiusMeters,
	})
	if err != nil {
		return nil, err
	}

	placeIDs := make([]uuid.UUID, 0, len(rows))
	byCategory := make(map[string][]database.ListNearbyPlacesRow)
	for _, row := range rows {
		cat := row.Category
		if cat == "" {
			cat = "Other"
		}
		list := byCategory[cat]
		if len(list) < placesPerCategory {
			byCategory[cat] = append(list, row)
			placeIDs = append(placeIDs, row.ID)
		}
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

	categoryNames := make([]string, 0, len(byCategory))
	for cat := range byCategory {
		categoryNames = append(categoryNames, cat)
	}
	sort.Slice(categoryNames, func(i, j int) bool {
		ni, nj := len(byCategory[categoryNames[i]]), len(byCategory[categoryNames[j]])
		if ni != nj {
			return ni > nj
		}
		return categoryNames[i] < categoryNames[j]
	})

	out := make([]CategoryPlaces, 0, len(byCategory))
	for _, cat := range categoryNames {
		list := byCategory[cat]
		places := make([]types.Result, 0, len(list))
		for _, row := range list {
			var images []types.PlaceImage
			if imagesByPlace != nil {
				images = imagesByPlace[row.ID]
			}
			var tags []string
			if row.Tags.Valid {
				_ = json.Unmarshal(row.Tags.RawMessage, &tags)
			}
			places = append(places, types.Result{
				ID:           row.ID,
				Name:         row.Name,
				Category:     row.Category,
				Latitude:     row.Latitude,
				Longitude:    row.Longitude,
				Images:       images,
				Description:  row.Description.String,
				Liked:        row.Liked,
				Tags:         tags,
				OpeningHours: row.OpeningHours.String,
				LikeCount:    row.LikeCount,
				SaveCount:    row.SaveCount,
				HideCount:    row.HideCount,
			})
		}
		out = append(out, CategoryPlaces{Category: cat, Places: places})
	}
	return out, nil
}
