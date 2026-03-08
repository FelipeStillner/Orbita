package auth

import (
	"context"
	"errors"
	"os"

	"google.golang.org/api/idtoken"
)

func VerifyGoogleToken(tokenString string) (*GoogleUser, error) {
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		return nil, errors.New("GOOGLE_CLIENT_ID is not set")
	}

	payload, err := idtoken.Validate(context.Background(), tokenString, googleClientID)
	if err != nil {
		return nil, errors.New("invalid google token: " + err.Error())
	}

	name, _ := payload.Claims["name"].(string)
	email, _ := payload.Claims["email"].(string)
	picture, _ := payload.Claims["picture"].(string)

	return &GoogleUser{
		GoogleID: payload.Subject,
		Name:     name,
		Email:    email,
		Picture:  picture,
	}, nil
}
