package collection

import (
	"encoding/json"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/google/uuid"
)

type listPlacesResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *handler) handleListPlaces(w http.ResponseWriter, r *http.Request) {
	// Handle the Request Structure
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
	collectionID, ok := parseListPlacesRequest(w, r)
	if !ok {
		return
	}

	// Application Logic
	ctx := r.Context()
	col, err := h.service.GetByID(ctx, collectionID)
	if err != nil {
		http.Error(w, "Collection not found", http.StatusNotFound)
		return
	}
	if col.UserID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	places, err := h.service.ListPlaces(ctx, collectionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle the Response
	out := make([]listPlacesResponse, len(places))
	for i, p := range places {
		out[i] = listPlacesResponse{
			ID:   p.ID.String(),
			Name: p.Name,
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}

func parseListPlacesRequest(w http.ResponseWriter, r *http.Request) (collectionID uuid.UUID, ok bool) {
	collectionIDStr := r.PathValue("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return uuid.Nil, false
	}
	return collectionID, true
}
