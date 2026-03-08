package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func GetUserByGoogleId(ctx context.Context, userGoogleID string) (*User, error) {
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

	return dbUserToUser(dbUser), nil
}

func GetUserByID(ctx context.Context, id string) (*User, error) {
	q, err := getQueries()
	if err != nil {
		return nil, err
	}

	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid user id: %w", err)
	}

	dbUser, err := q.GetUserByID(ctx, uid)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("get user by id: %w", err)
	}

	return dbUserToUser(dbUser), nil
}

func dbUserToUser(dbUser database.User) *User {
	return &User{
		ID:        dbUser.ID.String(),
		GoogleID:  dbUser.GoogleID,
		Name:      dbUser.Name.String,
		Email:     dbUser.Email.String,
		Picture:   dbUser.Picture.String,
		CreatedAt: dbUser.CreatedAt,
		UpdatedAt: dbUser.UpdatedAt,
	}
}
