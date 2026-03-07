package auth

import (
	"context"
	"log"
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
		googleUser, err := verifyGoogleToken(token)
		if err != nil {
			http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
			return
		}

		user, err := GetUser(r.Context(), googleUser.GoogleID)
		if err != nil {
			log.Printf("failed to get user by google id: %v", err)
			http.Error(w, "Failed to load user", http.StatusInternalServerError)
			return
		}

		if user == nil {
			user, err = NewUser(r.Context(), googleUser)
			if err != nil {
				log.Printf("failed to create user for google id %s: %v", googleUser.GoogleID, err)
				http.Error(w, "Failed to create user", http.StatusInternalServerError)
				return
			}
		}

		ctx := context.WithValue(r.Context(), "user", user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
