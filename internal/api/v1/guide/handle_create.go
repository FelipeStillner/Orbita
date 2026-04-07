package guide

import (
	"encoding/json"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	guideService "github.com/FelipeStillner/Orbita/internal/service/guide"
)

type createRequest struct {
	Title    string   `json:"title"`
	Blurb    string   `json:"blurb"`
	CoverURL string   `json:"cover_url"`
	Tags     []string `json:"tags"`
}

type createResponse struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

func (h *handler) handleCreate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}

	var req createRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}
	if req.Title == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	g, err := h.service.Create(ctx, userID, guideService.CreateInput{
		Title:    req.Title,
		Blurb:    req.Blurb,
		CoverURL: req.CoverURL,
		Tags:     req.Tags,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createResponse{ID: g.ID.String(), Title: g.Title})
}
