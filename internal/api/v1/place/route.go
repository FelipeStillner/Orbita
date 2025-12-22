package place

import (
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/service/place"
)

type handler struct {
	service *place.Service
}

func NewHandler(s *place.Service) *handler {
	return &handler{service: s}
}

func (h *handler) RegisterRoutes(router *http.ServeMux) {
	router.HandleFunc("GET /api/places", h.handleList)
}
