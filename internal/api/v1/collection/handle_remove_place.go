package collection

import (
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/google/uuid"
)

func (h *handler) handleRemovePlace(w http.ResponseWriter, r *http.Request) {
	// Handle the Request Structure
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
	collectionID, placeID, ok := parseRemovePlaceRequest(w, r)
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
	if err := h.service.RemovePlace(ctx, collectionID, placeID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle the Response
	w.WriteHeader(http.StatusNoContent)
}

func parseRemovePlaceRequest(w http.ResponseWriter, r *http.Request) (collectionID, placeID uuid.UUID, ok bool) {
	collectionIDStr := r.PathValue("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return uuid.Nil, uuid.Nil, false
	}
	placeIDStr := r.PathValue("placeId")
	placeID, err = uuid.Parse(placeIDStr)
	if err != nil {
		http.Error(w, "Invalid place ID", http.StatusBadRequest)
		return uuid.Nil, uuid.Nil, false
	}
	return collectionID, placeID, true
}
