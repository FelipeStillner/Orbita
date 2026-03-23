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
	router.Handle("GET /api/places/{id}", auth.OptionalAuthMiddleware(http.HandlerFunc(h.handleGet)))
	router.Handle("GET /api/places/home", auth.OptionalAuthMiddleware(http.HandlerFunc(h.handleListCategories)))
	router.Handle("GET /api/places", auth.OptionalAuthMiddleware(http.HandlerFunc(h.handleListPlaces)))
	router.Handle("GET /api/places/search", auth.OptionalAuthMiddleware(http.HandlerFunc(h.handleSearchPlaces)))
	router.Handle("POST /api/places/{id}/interaction", auth.AuthMiddleware(http.HandlerFunc(h.handleUpsertInteraction)))
}
