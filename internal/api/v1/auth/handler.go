package auth

import (
	"net/http"
)

type handler struct{}

func NewHandler() *handler {
	return &handler{}
}

func (h *handler) RegisterRoutes(router *http.ServeMux) {
	router.Handle("POST /api/auth/login", http.HandlerFunc(h.handleLogin))
}
