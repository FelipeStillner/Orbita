package place

import (
	"github.com/FelipeStillner/Orbita/internal/database"
)

type Service struct {
	queries *database.Queries
}

func NewService(q *database.Queries) *Service {
	return &Service{queries: q}
}
