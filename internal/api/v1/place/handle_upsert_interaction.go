package place

import (
	"encoding/json"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/google/uuid"
)

type interactionRequest struct {
	Liked  *bool `json:"liked,omitempty"`
	Hidden *bool `json:"hidden,omitempty"`
}

type interactionParams struct {
	PlaceID uuid.UUID
	Liked   bool
	Hidden  bool
}

func (h *handler) handleUpsertInteraction(w http.ResponseWriter, r *http.Request) {
	// Handle the Request Structure
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
	params, ok := parseInteractionRequest(w, r)
	if !ok {
		return
	}

	// Application Logic
	ctx := r.Context()
	if err := h.service.SetInteraction(ctx, userID, params.PlaceID, params.Liked, params.Hidden); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle the Response
	w.WriteHeader(http.StatusNoContent)
}

func parseInteractionRequest(w http.ResponseWriter, r *http.Request) (interactionParams, bool) {
	placeIDStr := r.PathValue("id")
	placeID, err := uuid.Parse(placeIDStr)
	if err != nil {
		http.Error(w, "Invalid place ID", http.StatusBadRequest)
		return interactionParams{}, false
	}

	var req interactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return interactionParams{}, false
	}

	liked := req.Liked != nil && *req.Liked
	hidden := req.Hidden != nil && *req.Hidden

	return interactionParams{
		PlaceID: placeID,
		Liked:   liked,
		Hidden:  hidden,
	}, true
}
