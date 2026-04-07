package api

import (
	"net/http"

	authHandler "github.com/FelipeStillner/Orbita/internal/api/v1/auth"
	guideHandler "github.com/FelipeStillner/Orbita/internal/api/v1/guide"
	placeHandler "github.com/FelipeStillner/Orbita/internal/api/v1/place"
	"github.com/FelipeStillner/Orbita/internal/database"
	guideService "github.com/FelipeStillner/Orbita/internal/service/guide"
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

	gs := guideService.NewService(s.Queries)
	gh := guideHandler.NewHandler(gs)
	gh.RegisterRoutes(s.Router)

	hs := healthHandler.NewHandler()
	hs.RegisterRoutes(s.Router)
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.Router.ServeHTTP(w, r)
}
