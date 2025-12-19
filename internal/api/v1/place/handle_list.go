package place

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func (h *handler) handleList(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("long"), 64)

	places, err := h.service.ListNearby(r.Context(), lat, long)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	features := []map[string]any{}
	for _, p := range places {
		features = append(features, map[string]any{
			"type":     "Feature",
			"geometry": p.GeoJSON,
			"properties": map[string]any{
				"id":     p.ID,
				"name":   p.Name,
				"images": p.Images,
			},
		})
	}

	json.NewEncoder(w).Encode(map[string]any{
		"type":     "FeatureCollection",
		"features": features,
	})
}
