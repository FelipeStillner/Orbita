package auth

import (
	"context"
	"errors"
	"os"

	"google.golang.org/api/idtoken"
)

func verifyGoogleToken(tokenString string) (string, error) {
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		return "", errors.New("GOOGLE_CLIENT_ID is not set")
	}

	payload, err := idtoken.Validate(context.Background(), tokenString, googleClientID)
	if err != nil {
		return "", errors.New("invalid google token: " + err.Error())
	}

	return payload.Subject, nil
}
