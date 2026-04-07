package guide

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/internal/shared/timex"
	"github.com/google/uuid"
)

func (s *Service) GetDetail(ctx context.Context, userID, guideID uuid.UUID) (Detail, error) {
	g, err := s.queries.GetGuide(ctx, database.GetGuideParams{
		ID:     guideID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Detail{}, ErrNotFound
		}
		return Detail{}, err
	}

	steps, err := s.queries.ListGuideStepsByGuideID(ctx, guideID)
	if err != nil {
		return Detail{}, err
	}
	stepIDs := make([]uuid.UUID, len(steps))
	for i := range steps {
		stepIDs[i] = steps[i].ID
	}

	var placeRows []database.ListGuideStepPlacesWithPlaceRow
	if len(stepIDs) > 0 {
		placeRows, err = s.queries.ListGuideStepPlacesWithPlace(ctx, stepIDs)
		if err != nil {
			return Detail{}, err
		}
	}

	byStep := make(map[uuid.UUID][]PlaceInStep)
	for _, row := range placeRows {
		opt := ""
		if row.OptionNote.Valid {
			opt = row.OptionNote.String
		}
		tags := tagsFromPlaceTags(row.Tags)
		var isOpen *bool
		if row.OpeningHours.Valid && strings.TrimSpace(row.OpeningHours.String) != "" {
			isOpen = timex.IsOpenNow(strings.TrimSpace(row.OpeningHours.String), venueTimeLocation())
		}
		byStep[row.GuideStepID] = append(byStep[row.GuideStepID], PlaceInStep{
			PlaceID:         row.PlaceID,
			Name:            row.PlaceName,
			Latitude:        row.Latitude,
			Longitude:       row.Longitude,
			OptionNote:      opt,
			Position:        row.Position,
			PrimaryImageURL: row.PrimaryImageUrl,
			ImageURLs:       stringSliceFromJSONText(row.ImageUrls),
			Tags:            tags,
			PhotoCount:      row.PhotoCount,
			LikeCount:       row.LikeCount,
			IsOpenNow:       isOpen,
		})
	}

	stepDetails := make([]StepDetail, 0, len(steps))
	for idx, st := range steps {
		note := ""
		if st.StepNote.Valid {
			note = st.StepNote.String
		}
		places := byStep[st.ID]
		if places == nil {
			places = []PlaceInStep{}
		}
		stepDetails = append(stepDetails, StepDetail{
			ID:         st.ID,
			Position:   st.Position,
			StepTitle:  st.StepTitle,
			StepNote:   note,
			Places:     places,
			StepIndex:  idx,
		})
	}

	blurb := ""
	if g.Blurb.Valid {
		blurb = g.Blurb.String
	}
	cover := ""
	if g.CoverUrl.Valid {
		cover = g.CoverUrl.String
	}

	return Detail{
		ID:        g.ID,
		Title:     g.Title,
		Blurb:     blurb,
		CoverURL:  cover,
		Tags:      tagsFromRaw(g.Tags),
		CreatedAt: g.CreatedAt,
		UpdatedAt: g.UpdatedAt,
		Steps:     stepDetails,
	}, nil
}

func venueTimeLocation() *time.Location {
	loc, err := time.LoadLocation("Europe/Lisbon")
	if err != nil {
		return time.UTC
	}
	return loc
}
