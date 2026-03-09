package collection

import (
	"errors"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/FelipeStillner/Orbita/internal/service/collection"
	"github.com/google/uuid"
)

func (h *handler) handleDelete(w http.ResponseWriter, r *http.Request) {
	// Handle the Request Structure
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
	collectionID, ok := parseDeleteRequest(w, r)
	if !ok {
		return
	}

	// Application Logic
	ctx := r.Context()
	if err := h.service.Delete(ctx, collectionID, userID); err != nil {
		if errors.Is(err, collection.ErrNotFound) {
			http.Error(w, "Collection not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle the Response
	w.WriteHeader(http.StatusNoContent)
}

func parseDeleteRequest(w http.ResponseWriter, r *http.Request) (collectionID uuid.UUID, ok bool) {
	collectionIDStr := r.PathValue("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return uuid.Nil, false
	}
	return collectionID, true
}
