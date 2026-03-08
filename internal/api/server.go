package api

import (
	"net/http"

	authHandler "github.com/FelipeStillner/Orbita/internal/api/v1/auth"
	collectionHandler "github.com/FelipeStillner/Orbita/internal/api/v1/collection"
	placeHandler "github.com/FelipeStillner/Orbita/internal/api/v1/place"
	"github.com/FelipeStillner/Orbita/internal/database"
	collectionService "github.com/FelipeStillner/Orbita/internal/service/collection"
	placeService "github.com/FelipeStillner/Orbita/internal/service/place"

	healthHandler "github.com/FelipeStillner/Orbita/internal/api/v1/health"
)

type Server struct {
	Queries *database.Queries
	Router  *http.ServeMux
}

func NewServer(q *database.Queries) *Server {
	s := &Server{
		Queries: q,
		Router:  http.NewServeMux(),
	}
	s.mountRoutes()
	return s
}

func (s *Server) mountRoutes() {
	ah := authHandler.NewHandler()
	ah.RegisterRoutes(s.Router)

	ps := placeService.NewService(s.Queries)
	ph := placeHandler.NewHandler(ps)
	ph.RegisterRoutes(s.Router)

	cs := collectionService.NewService(s.Queries)
	ch := collectionHandler.NewHandler(cs)
	ch.RegisterRoutes(s.Router)

	hs := healthHandler.NewHandler()
	hs.RegisterRoutes(s.Router)
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.Router.ServeHTTP(w, r)
}
