package collection

import (
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
)

var ErrNotFound = errors.New("collection not found")

type Service struct {
	queries *database.Queries
}

func NewService(q *database.Queries) *Service {
	return &Service{queries: q}
}
