package collection

import (
	"encoding/json"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/google/uuid"
)

type addPlaceRequest struct {
	PlaceID string `json:"place_id"`
}

func (h *handler) handleAddPlace(w http.ResponseWriter, r *http.Request) {
	// Handle the Request Structure
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
	collectionID, placeID, ok := parseAddPlaceRequest(w, r)
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
	if err := h.service.AddPlace(ctx, collectionID, placeID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle the Response
	w.WriteHeader(http.StatusNoContent)
}

func parseAddPlaceRequest(w http.ResponseWriter, r *http.Request) (collectionID, placeID uuid.UUID, ok bool) {
	collectionIDStr := r.PathValue("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return uuid.Nil, uuid.Nil, false
	}
	var req addPlaceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return uuid.Nil, uuid.Nil, false
	}
	if req.PlaceID == "" {
		http.Error(w, "place_id is required", http.StatusBadRequest)
		return uuid.Nil, uuid.Nil, false
	}
	placeID, err = uuid.Parse(req.PlaceID)
	if err != nil {
		http.Error(w, "Invalid place_id", http.StatusBadRequest)
		return uuid.Nil, uuid.Nil, false
	}
	return collectionID, placeID, true
}
