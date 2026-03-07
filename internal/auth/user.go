package auth

import (
	"time"
)

type User struct {
	ID        string
	GoogleID  string
	Name      string
	Email     string
	Picture   string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type GoogleUser struct {
	GoogleID string
	Name     string
	Email    string
	Picture  string
}
