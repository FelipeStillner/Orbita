package guide

import (
	"net/http"

	"github.com/FelipeStillner/Orbita/internal/auth"
	guideService "github.com/FelipeStillner/Orbita/internal/service/guide"
)

type handler struct {
	service *guideService.Service
}

func NewHandler(s *guideService.Service) *handler {
	return &handler{service: s}
}

func (h *handler) RegisterRoutes(router *http.ServeMux) {
	router.Handle("GET /api/guides", auth.AuthMiddleware(http.HandlerFunc(h.handleList)))
	router.Handle("POST /api/guides", auth.AuthMiddleware(http.HandlerFunc(h.handleCreate)))
	router.Handle("GET /api/guides/{id}", auth.AuthMiddleware(http.HandlerFunc(h.handleGet)))
	router.Handle("PATCH /api/guides/{id}", auth.AuthMiddleware(http.HandlerFunc(h.handlePatch)))
	router.Handle("POST /api/guides/{id}/steps", auth.AuthMiddleware(http.HandlerFunc(h.handleCreateStep)))
	router.Handle("PATCH /api/guides/{id}/steps/{stepId}", auth.AuthMiddleware(http.HandlerFunc(h.handlePatchStep)))
	router.Handle("PATCH /api/guides/{id}/steps/{stepId}/places/{placeId}", auth.AuthMiddleware(http.HandlerFunc(h.handlePatchPlaceOption)))
	router.Handle("DELETE /api/guides/{id}", auth.AuthMiddleware(http.HandlerFunc(h.handleDelete)))
	router.Handle("DELETE /api/guides/{id}/places/{placeId}", auth.AuthMiddleware(http.HandlerFunc(h.handleRemovePlace)))
	router.Handle("POST /api/guides/{id}/steps/{stepId}/places", auth.AuthMiddleware(http.HandlerFunc(h.handleAddPlace)))
	router.Handle("DELETE /api/guides/{id}/steps/{stepId}/places/{placeId}", auth.AuthMiddleware(http.HandlerFunc(h.handleRemovePlaceFromStep)))
}
