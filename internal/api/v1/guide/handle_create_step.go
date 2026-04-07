package guide

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	guideService "github.com/FelipeStillner/Orbita/internal/service/guide"
	"github.com/google/uuid"
)

type createStepRequest struct {
	StepTitle *string `json:"step_title"`
	StepNote  *string `json:"step_note"`
}

type createStepResponse struct {
	ID       string `json:"id"`
	Position int32  `json:"position"`
}

func (h *handler) handleCreateStep(w http.ResponseWriter, r *http.Request) {
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

	var req createStepRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}
	title := ""
	if req.StepTitle != nil {
		title = *req.StepTitle
	}
	note := ""
	if req.StepNote != nil {
		note = *req.StepNote
	}

	ctx := r.Context()
	step, err := h.service.CreateStep(ctx, userID, guideID, title, note)
	if err != nil {
		if errors.Is(err, guideService.ErrNotFound) {
			http.Error(w, "Guide not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createStepResponse{
		ID:       step.ID.String(),
		Position: step.Position,
	})
}
