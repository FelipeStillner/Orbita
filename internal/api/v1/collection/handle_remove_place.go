package collection

import (
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/google/uuid"
)

func (h *handler) handleRemovePlace(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
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
	col, err := h.service.GetByID(ctx, collectionID)
	if err != nil {
		http.Error(w, "Collection not found", http.StatusNotFound)
		return
	}
	if col.UserID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	placeIDStr := r.PathValue("placeId")
	placeID, err := uuid.Parse(placeIDStr)
	if err != nil {
		http.Error(w, "Invalid place ID", http.StatusBadRequest)
		return
	}
	if err := h.service.RemovePlace(ctx, collectionID, placeID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
