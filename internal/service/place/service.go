package place

import (
	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/internal/provider/osm"
	"github.com/FelipeStillner/Orbita/internal/provider/wikidata"
	"golang.org/x/sync/singleflight"
)

type Service struct {
	queries  *database.Queries
	osm      *osm.Client
	wikidata *wikidata.Client
	g        singleflight.Group
}

func NewService(q *database.Queries) *Service {
	return &Service{
		queries:  q,
		osm:      osm.NewClient(),
		wikidata: wikidata.NewClient(),
		g:        singleflight.Group{},
	}
}
