package place

import (
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/FelipeStillner/Orbita/internal/service/place"
)

type handler struct {
	service *place.Service
}

func NewHandler(s *place.Service) *handler {
	return &handler{service: s}
}

func (h *handler) RegisterRoutes(router *http.ServeMux) {
	router.Handle("GET /api/places", auth.AuthMiddleware(http.HandlerFunc(h.handleList)))
	router.Handle("POST /api/places/{id}/interaction", auth.AuthMiddleware(http.HandlerFunc(h.handleInteraction)))
}
