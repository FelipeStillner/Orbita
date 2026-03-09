package collection

import (
	"errors"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/FelipeStillner/Orbita/internal/service/collection"
	"github.com/google/uuid"
)

func (h *handler) handleDelete(w http.ResponseWriter, r *http.Request) {
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
	if err := h.service.Delete(ctx, collectionID, userID); err != nil {
		if errors.Is(err, collection.ErrNotFound) {
			http.Error(w, "Collection not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
