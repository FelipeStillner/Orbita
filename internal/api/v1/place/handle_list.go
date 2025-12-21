package place

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func (h *handler) handleList(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("long"), 64)

	pageStr := r.URL.Query().Get("page")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limitStr := r.URL.Query().Get("limit")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}

	offset := (page - 1) * limit

	places, err := h.service.ListNearby(r.Context(), lat, long, int32(limit), int32(offset))
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
		"meta": map[string]int{
			"page":  page,
			"limit": limit,
		},
	})
}
