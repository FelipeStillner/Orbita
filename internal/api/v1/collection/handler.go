package collection

import (
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	"github.com/FelipeStillner/Orbita/internal/service/collection"
)

type handler struct {
	service *collection.Service
}

func NewHandler(s *collection.Service) *handler {
	return &handler{service: s}
}

func (h *handler) RegisterRoutes(router *http.ServeMux) {
	router.Handle("GET /api/collections", auth.AuthMiddleware(http.HandlerFunc(h.handleList)))
	router.Handle("POST /api/collections", auth.AuthMiddleware(http.HandlerFunc(h.handleCreate)))
	router.Handle("POST /api/collections/{id}/places", auth.AuthMiddleware(http.HandlerFunc(h.handleAddPlace)))
	router.Handle("DELETE /api/collections/{id}/places/{placeId}", auth.AuthMiddleware(http.HandlerFunc(h.handleRemovePlace)))
}
