package collection

import (
	"encoding/json"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
)

type listResponse struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	PlaceCount int32  `json:"place_count"`
}

func (h *handler) handleList(w http.ResponseWriter, r *http.Request) {
	// Handle the Request Structure
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}

	// Application Logic
	ctx := r.Context()
	cols, err := h.service.ListByUserWithPlaceCount(ctx, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle the Response
	out := make([]listResponse, len(cols))
	for i, c := range cols {
		out[i] = listResponse{
			ID:         c.ID.String(),
			Name:       c.Name,
			PlaceCount: c.PlaceCount,
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}
