package guide

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	guideService "github.com/FelipeStillner/Orbita/internal/service/guide"
	"github.com/google/uuid"
)

type patchRequest struct {
	Title    *string   `json:"title"`
	Blurb    *string   `json:"blurb"`
	CoverURL *string   `json:"cover_url"`
	Tags     *[]string `json:"tags"`
}

type patchResponse struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

func (h *handler) handlePatch(w http.ResponseWriter, r *http.Request) {
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

	var req patchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	g, err := h.service.Update(ctx, userID, guideID, guideService.PatchInput{
		Title:    req.Title,
		Blurb:    req.Blurb,
		CoverURL: req.CoverURL,
		Tags:     req.Tags,
	})
	if err != nil {
		if errors.Is(err, guideService.ErrNotFound) {
			http.Error(w, "Guide not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(patchResponse{ID: g.ID.String(), Title: g.Title})
}
