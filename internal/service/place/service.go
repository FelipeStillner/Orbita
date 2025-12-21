package place

import (
	"github.com/FelipeStillner/Orbita/internal/adapter/osm"
	"github.com/FelipeStillner/Orbita/internal/adapter/wikidata"
	"github.com/FelipeStillner/Orbita/internal/database"
)

type Service struct {
	queries  *database.Queries
	osm      *osm.Client
	wikidata *wikidata.Client
}

func NewService(q *database.Queries) *Service {
	return &Service{
		queries:  q,
		osm:      osm.NewClient(),
		wikidata: wikidata.NewClient(),
	}
}
