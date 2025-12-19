package health

import (
	"net/http"
)

type handler struct{}

func NewHandler() *handler {
	return &handler{}
}

func (h *handler) RegisterRoutes(router *http.ServeMux) {
	router.HandleFunc("GET /api/health", h.handleHealth)
}
