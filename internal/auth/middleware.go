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
		userID, err := VerifyToken(token)
		if err != nil {
			http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
			return
		}

		user, err := GetUserByID(r.Context(), userID)
		if err != nil {
			log.Printf("failed to get user by id: %v", err)
			http.Error(w, "Failed to load user", http.StatusInternalServerError)
			return
		}

		if user == nil {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "user", user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if len(authHeader) < 8 || authHeader[:7] != "Bearer " {
			next.ServeHTTP(w, r)
			return
		}

		token := authHeader[7:]
		userID, err := VerifyToken(token)
		if err != nil {
			// Guest mode: ignore invalid/expired tokens and continue as unauthenticated.
			next.ServeHTTP(w, r)
			return
		}

		user, err := GetUserByID(r.Context(), userID)
		if err != nil {
			log.Printf("failed to get user by id: %v", err)
			// Guest mode: if we can't load the user, continue as unauthenticated.
			next.ServeHTTP(w, r)
			return
		}

		if user == nil {
			// Guest mode: unknown user -> behave like guest.
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), "user", user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
