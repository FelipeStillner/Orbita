package guide

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/FelipeStillner/Orbita/internal/auth"
	guideService "github.com/FelipeStillner/Orbita/internal/service/guide"
	"github.com/google/uuid"
)

type getPlace struct {
	PlaceID           string   `json:"place_id"`
	Name              string   `json:"name"`
	Lat               float64  `json:"lat"`
	Lon               float64  `json:"lon"`
	OptionNote        string   `json:"option_note"`
	Position          int32    `json:"position"`
	PrimaryImageURL   string   `json:"primary_image_url"`
	ImageURLs         []string `json:"image_urls"`
	Tags              []string `json:"tags"`
	PhotoCount        int32    `json:"photo_count"`
	LikeCount         int32    `json:"like_count"`
	IsOpenNow         *bool    `json:"is_open_now,omitempty"`
}

type getStep struct {
	ID         string     `json:"id"`
	Position   int32      `json:"position"`
	StepTitle  string     `json:"step_title"`
	StepNote   string     `json:"step_note"`
	Places     []getPlace `json:"places"`
	StepIndex  int        `json:"step_index"`
}

type getDetailResponse struct {
	ID        string            `json:"id"`
	Title     string            `json:"title"`
	Blurb     string            `json:"blurb"`
	CoverURL  string            `json:"cover_url"`
	Tags      []string          `json:"tags"`
	CreatedAt string            `json:"created_at"`
	UpdatedAt string            `json:"updated_at"`
	Steps     []getStep         `json:"steps"`
}

func (h *handler) handleGet(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
	guideID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid guide ID", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	d, err := h.service.GetDetail(ctx, userID, guideID)
	if err != nil {
		if errors.Is(err, guideService.ErrNotFound) {
			http.Error(w, "Guide not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	steps := make([]getStep, len(d.Steps))
	for i, s := range d.Steps {
		places := make([]getPlace, len(s.Places))
		for j, p := range s.Places {
			places[j] = getPlace{
				PlaceID:         p.PlaceID.String(),
				Name:            p.Name,
				Lat:             p.Latitude,
				Lon:             p.Longitude,
				OptionNote:      p.OptionNote,
				Position:        p.Position,
				PrimaryImageURL: p.PrimaryImageURL,
				ImageURLs:       p.ImageURLs,
				Tags:            p.Tags,
				PhotoCount:      p.PhotoCount,
				LikeCount:       p.LikeCount,
				IsOpenNow:       p.IsOpenNow,
			}
		}
		steps[i] = getStep{
			ID:        s.ID.String(),
			Position:  s.Position,
			StepTitle: s.StepTitle,
			StepNote:  s.StepNote,
			Places:    places,
			StepIndex: s.StepIndex,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(getDetailResponse{
		ID:        d.ID.String(),
		Title:     d.Title,
		Blurb:     d.Blurb,
		CoverURL:  d.CoverURL,
		Tags:      d.Tags,
		CreatedAt: d.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: d.UpdatedAt.UTC().Format(time.RFC3339),
		Steps:     steps,
	})
}
