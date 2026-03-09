package collection

import (
	"encoding/json"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
)

type createRequest struct {
	Name string `json:"name"`
}

type createResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *handler) handleCreate(w http.ResponseWriter, r *http.Request) {
	// Handle the Request Structure
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
	name, ok := parseCreateRequest(w, r)
	if !ok {
		return
	}

	// Application Logic
	ctx := r.Context()
	c, err := h.service.Create(ctx, userID, name)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle the Response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createResponse{ID: c.ID.String(), Name: c.Name})
}

func parseCreateRequest(w http.ResponseWriter, r *http.Request) (name string, ok bool) {
	var req createRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return "", false
	}
	if req.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return "", false
	}
	return req.Name, true
}
