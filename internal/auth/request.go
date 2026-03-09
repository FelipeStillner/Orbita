package auth

import (
	"net/http"

	"github.com/google/uuid"
)

func UserIDFromRequest(w http.ResponseWriter, r *http.Request) (uuid.UUID, bool) {
	ctx := r.Context()
	u, ok := ctx.Value("user").(*User)
	if !ok || u == nil {
		http.Error(w, "User not found in context", http.StatusInternalServerError)
		return uuid.Nil, false
	}
	userID, err := uuid.Parse(u.ID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusInternalServerError)
		return uuid.Nil, false
	}
	return userID, true
}
