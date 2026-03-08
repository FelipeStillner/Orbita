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
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx := r.Context()
	u, ok := ctx.Value("user").(*auth.User)
	if !ok || u == nil {
		http.Error(w, "User not found in context", http.StatusInternalServerError)
		return
	}
	userID, err := uuid.Parse(u.ID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusInternalServerError)
		return
	}
	collectionIDStr := r.PathValue("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return
	}
	var req addPlaceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}
	if req.PlaceID == "" {
		http.Error(w, "place_id is required", http.StatusBadRequest)
		return
	}
	placeID, err := uuid.Parse(req.PlaceID)
	if err != nil {
		http.Error(w, "Invalid place_id", http.StatusBadRequest)
		return
	}
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
	w.WriteHeader(http.StatusNoContent)
}
