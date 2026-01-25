package place

import (
	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/internal/provider/osm"
	"github.com/FelipeStillner/Orbita/internal/provider/wikidata"
	"github.com/FelipeStillner/Orbita/internal/service/place/interfaces"
	"golang.org/x/sync/singleflight"
)

type Service struct {
	queries  *database.Queries
	osm      interfaces.PlaceProvider
	wikidata interfaces.PlaceEnricher
	g        singleflight.Group
}

func NewService(q *database.Queries) *Service {
	return &Service{
		queries:  q,
		osm:      osm.NewProvider(),
		wikidata: wikidata.NewProvider(),
		g:        singleflight.Group{},
	}
}
