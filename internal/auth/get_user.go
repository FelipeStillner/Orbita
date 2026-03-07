package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

func GetUser(ctx context.Context, userGoogleID string) (*User, error) {
	q, err := getQueries()
	if err != nil {
		return nil, err
	}

	dbUser, err := q.GetUserByGoogleID(ctx, userGoogleID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("get user by google id: %w", err)
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
