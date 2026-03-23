package place

import (
	"encoding/json"
	"net/http"
	"strconv"
)

const defaultSearchSizeMeters = 5000

type searchPlacesRequest struct {
	Lat  float64 `json:"lat"`
	Lon  float64 `json:"lon"`
	Size int     `json:"size"`
}

type searchPlaceItem struct {
	Name         string   `json:"name"`
	Category     string   `json:"category"`
	Latitude     float64  `json:"latitude"`
	Longitude    float64  `json:"longitude"`
	Tags         []string `json:"tags,omitempty"`
	OpeningHours string   `json:"opening_hours,omitempty"`
}

type searchPlacesResponse struct {
	Places []searchPlaceItem `json:"places"`
}

func (h *handler) handleSearchPlaces(w http.ResponseWriter, r *http.Request) {
	req, ok := parseSearchPlacesRequest(w, r)
	if !ok {
		return
	}

	ctx := r.Context()
	places, err := h.service.SearchPlaces(ctx, req.Lat, req.Lon, req.Size)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	items := make([]searchPlaceItem, 0, len(places))
	for _, p := range places {
		items = append(items, searchPlaceItem{
			Name:         p.Name,
			Category:     p.Category,
			Latitude:     p.Lat,
			Longitude:    p.Long,
			Tags:         p.Tags,
			OpeningHours: p.OpeningHours,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(searchPlacesResponse{Places: items})
}

func parseSearchPlacesRequest(w http.ResponseWriter, r *http.Request) (searchPlacesRequest, bool) {
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	if err != nil {
		http.Error(w, "missing or invalid lat", http.StatusBadRequest)
		return searchPlacesRequest{}, false
	}
	lon, err := strconv.ParseFloat(r.URL.Query().Get("lon"), 64)
	if err != nil {
		http.Error(w, "missing or invalid lon", http.StatusBadRequest)
		return searchPlacesRequest{}, false
	}
	size := defaultSearchSizeMeters
	if s := r.URL.Query().Get("size"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			size = n
		}
	}
	return searchPlacesRequest{Lat: lat, Lon: lon, Size: size}, true
}
