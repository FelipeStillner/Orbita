package place

import (
	"github.com/FelipeStillner/Orbita/internal/adapter/osm"
	"github.com/FelipeStillner/Orbita/internal/database"
)

type Service struct {
	queries *database.Queries
	osm     *osm.Client
}

func NewService(q *database.Queries) *Service {
	return &Service{
		queries: q,
		osm:     osm.NewClient(),
	}
}
