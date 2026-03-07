package auth

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/FelipeStillner/Orbita/internal/database"
)

func NewUser(ctx context.Context, gUser *GoogleUser) (*User, error) {
	q, err := getQueries()
	if err != nil {
		return nil, err
	}

	dbUser, err := q.CreateUser(ctx, database.CreateUserParams{
		GoogleID: gUser.GoogleID,
		Name: sql.NullString{
			String: gUser.Name,
			Valid:  gUser.Name != "",
		},
		Email: sql.NullString{
			String: gUser.Email,
			Valid:  gUser.Email != "",
		},
		Picture: sql.NullString{
			String: gUser.Picture,
			Valid:  gUser.Picture != "",
		},
	})
	if err != nil {
		return nil, fmt.Errorf("create user with google id: %w", err)
	}

	return &User{
		ID:        dbUser.ID.String(),
		GoogleID:  dbUser.GoogleID,
		Name:      dbUser.Name.String,
		Email:     dbUser.Email.String,
		Picture:   dbUser.Picture.String,
		CreatedAt: dbUser.CreatedAt,
		UpdatedAt: dbUser.UpdatedAt,
	}, nil
}
