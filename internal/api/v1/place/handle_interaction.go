package place

import (
	"encoding/json"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/google/uuid"
)

type interactionRequest struct {
	Liked    *bool `json:"liked,omitempty"`
	Disliked *bool `json:"disliked,omitempty"`
	Visited  *bool `json:"visited,omitempty"`
	Saved    *bool `json:"saved,omitempty"`
}

func (h *handler) handleInteraction(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user from context.
	ctx := r.Context()
	uVal := ctx.Value("user")
	u, ok := uVal.(*auth.User)
	if !ok || u == nil {
		http.Error(w, "User not found in context", http.StatusInternalServerError)
		return
	}

	// Parse place ID from path.
	placeIDStr := r.PathValue("id")
	placeID, err := uuid.Parse(placeIDStr)
	if err != nil {
		http.Error(w, "Invalid place ID", http.StatusBadRequest)
		return
	}

	// Decode request body.
	var req interactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	// Default missing fields to neutral / false.
	liked := req.Liked != nil && *req.Liked
	disliked := req.Disliked != nil && *req.Disliked
	visited := req.Visited != nil && *req.Visited
	saved := req.Saved != nil && *req.Saved

	var rating int32 = 0
	if liked {
		rating = 1
	} else if disliked {
		rating = -1
	}

	userID, err := uuid.Parse(u.ID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusInternalServerError)
		return
	}

	if err := h.service.SetInteraction(ctx, userID, placeID, rating, visited, saved); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

