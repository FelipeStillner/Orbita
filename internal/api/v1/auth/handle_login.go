package auth

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
)

type loginRequest struct {
	GoogleToken string `json:"google_token"`
}

type loginResponse struct {
	Token string `json:"token"`
}

func (h *handler) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.GoogleToken == "" {
		http.Error(w, "google_token is required", http.StatusBadRequest)
		return
	}

	googleUser, err := auth.VerifyGoogleToken(req.GoogleToken)
	if err != nil {
		http.Error(w, "Invalid Google token: "+err.Error(), http.StatusUnauthorized)
		return
	}

	user, err := auth.GetUserByGoogleId(r.Context(), googleUser.GoogleID)
	if err != nil {
		log.Printf("failed to get user by google id: %v", err)
		http.Error(w, "Failed to load user", http.StatusInternalServerError)
		return
	}

	if user == nil {
		user, err = auth.NewUser(r.Context(), googleUser)
		if err != nil {
			log.Printf("failed to create user for google id %s: %v", googleUser.GoogleID, err)
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}
	}

	token, err := auth.IssueToken(user)
	if err != nil {
		log.Printf("failed to issue jwt: %v", err)
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loginResponse{Token: token})
}
