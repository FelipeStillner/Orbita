package guide

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	guideService "github.com/FelipeStillner/Orbita/internal/service/guide"
	"github.com/google/uuid"
)

type addPlaceRequest struct {
	PlaceID    string  `json:"place_id"`
	OptionNote *string `json:"option_note,omitempty"`
}

func (h *handler) handleAddPlace(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
	guideID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid guide ID", http.StatusBadRequest)
		return
	}
	stepID, err := uuid.Parse(r.PathValue("stepId"))
	if err != nil {
		http.Error(w, "Invalid step ID", http.StatusBadRequest)
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

	optNote := ""
	if req.OptionNote != nil {
		optNote = *req.OptionNote
	}

	ctx := r.Context()
	if err := h.service.AddPlaceToStep(ctx, userID, guideID, stepID, placeID, optNote); err != nil {
		if errors.Is(err, guideService.ErrNotFound) {
			http.Error(w, "Guide or step not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
