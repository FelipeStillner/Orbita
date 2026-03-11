package place

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/FelipeStillner/Orbita/internal/service/place"
	"github.com/google/uuid"
)

func (h *handler) handleGet(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}

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

	images := make([]listPlaceImage, len(p.Images))
	for j, img := range p.Images {
		images[j] = listPlaceImage{
			URL:         img.URL,
			Description: img.Description,
			IsPrimary:   img.IsPrimary,
		}
	}
	collections := make([]listCollectionItem, len(p.Collections))
	for j, c := range p.Collections {
		collections[j] = listCollectionItem{ID: c.ID.String(), Name: c.Name}
	}
	item := listPlaceItem{
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
