package guide

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	guideService "github.com/FelipeStillner/Orbita/internal/service/guide"
	"github.com/google/uuid"
)

type patchPlaceOptionRequest struct {
	OptionNote *string `json:"option_note"`
}

func (h *handler) handlePatchPlaceOption(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
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
	placeID, err := uuid.Parse(r.PathValue("placeId"))
	if err != nil {
		http.Error(w, "Invalid place ID", http.StatusBadRequest)
		return
	}

	var req patchPlaceOptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}
	if req.OptionNote == nil {
		http.Error(w, "option_note is required (use \"\" to clear)", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	if err := h.service.UpdatePlaceOptionNote(ctx, userID, guideID, stepID, placeID, *req.OptionNote); err != nil {
		if errors.Is(err, guideService.ErrNotFound) {
			http.Error(w, "Guide or step not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
