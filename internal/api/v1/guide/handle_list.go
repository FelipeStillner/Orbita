package guide

import (
	"encoding/json"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
)

type listResponseItem struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	StepCount  int32  `json:"step_count"`
	PlaceCount int32  `json:"place_count"`
}

func (h *handler) handleList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}

	ctx := r.Context()
	guides, err := h.service.ListByUser(ctx, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	out := make([]listResponseItem, len(guides))
	for i, g := range guides {
		out[i] = listResponseItem{
			ID:         g.ID.String(),
			Title:      g.Title,
			StepCount:  g.StepCount,
			PlaceCount: g.PlaceCount,
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}
