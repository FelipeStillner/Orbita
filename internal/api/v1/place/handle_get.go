package place

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/FelipeStillner/Orbita/internal/service/place"
	"github.com/google/uuid"
)

type getPlaceCollectionItem struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type getPlaceImage struct {
	URL         string `json:"url"`
	Description string `json:"description"`
	IsPrimary   bool   `json:"is_primary"`
}

type getPlaceItem struct {
	ID           string                   `json:"id"`
	Name         string                   `json:"name"`
	Latitude     float64                  `json:"latitude"`
	Longitude    float64                  `json:"longitude"`
	Images       []getPlaceImage          `json:"images"`
	Description  string                   `json:"description"`
	Category     string                   `json:"category"`
	Liked        bool                     `json:"liked"`
	Collections  []getPlaceCollectionItem `json:"collections"`
	Tags         []string                 `json:"tags,omitempty"`
	OpeningHours string                   `json:"opening_hours,omitempty"`
	LikeCount    int32                    `json:"like_count"`
	SaveCount    int32                    `json:"save_count"`
	HideCount    int32                    `json:"hide_count"`
}

func (h *handler) handleGet(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromRequestOptional(w, r)

	idStr := r.PathValue("id")
	if idStr == "" {
		http.Error(w, "missing place id", http.StatusBadRequest)
		return
	}
	placeID, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid place id", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	p, err := h.service.GetByID(ctx, userID, placeID)
	if err != nil {
		if errors.Is(err, place.ErrNotFound) {
			http.Error(w, "place not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	images := make([]getPlaceImage, len(p.Images))
	for j, img := range p.Images {
		images[j] = getPlaceImage{
			URL:         img.URL,
			Description: img.Description,
			IsPrimary:   img.IsPrimary,
		}
	}
	collections := make([]getPlaceCollectionItem, len(p.Collections))
	for j, c := range p.Collections {
		collections[j] = getPlaceCollectionItem{ID: c.ID.String(), Name: c.Name}
	}
	item := getPlaceItem{
		ID:           p.ID.String(),
		Name:         p.Name,
		Latitude:     p.Latitude,
		Longitude:    p.Longitude,
		Images:       images,
		Description:  p.Description,
		Category:     p.Category,
		Liked:        p.Liked,
		Collections:  collections,
		Tags:         p.Tags,
		OpeningHours: p.OpeningHours,
		LikeCount:    p.LikeCount,
		SaveCount:    p.SaveCount,
		HideCount:    p.HideCount,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}
