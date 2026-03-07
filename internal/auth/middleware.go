package auth

import (
	"context"
	"net/http"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if len(authHeader) < 8 || authHeader[:7] != "Bearer " {
			http.Error(w, "Expected Authorization header with Bearer token", http.StatusUnauthorized)
			return
		}

		token := authHeader[7:]
		userID, err := verifyGoogleToken(token)
		if err != nil {
			http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "userGoogleID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
