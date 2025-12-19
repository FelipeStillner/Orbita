package health

import (
	"net/http"
)

func (h *handler) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status": "ok", "project": "Orbita", "version": "v1"}`))
}
