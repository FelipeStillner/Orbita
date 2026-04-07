package guide

import (
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
)

var ErrNotFound = errors.New("guide not found")

type Service struct {
	queries *database.Queries
}

func NewService(q *database.Queries) *Service {
	return &Service{queries: q}
}
