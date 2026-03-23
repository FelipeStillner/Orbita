package place

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/FelipeStillner/Orbita/internal/auth"
)

type listPlacesRequest struct {
	Lat      float64
	Long     float64
	Category string
}

type listPlaceImage struct {
	URL         string `json:"url"`
	Description string `json:"description"`
	IsPrimary   bool   `json:"is_primary"`
}

type listPlaceItem struct {
	ID       string           `json:"id"`
	Name     string           `json:"name"`
	Category string           `json:"category"`
	Images   []listPlaceImage `json:"images"`
}

type listPlacesResponse struct {
	Places []listPlaceItem `json:"places"`
}

func (h *handler) handleListPlaces(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromRequestOptional(w, r)
	req, ok := parseListPlacesRequest(w, r)
	if !ok {
		return
	}

	ctx := r.Context()
	places, err := h.service.ListPlaces(ctx, userID, req.Lat, req.Long, req.Category)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	items := make([]listPlaceItem, 0, len(places))
	for _, p := range places {
		images := make([]listPlaceImage, len(p.Images))
		for j, img := range p.Images {
			images[j] = listPlaceImage{
				URL:         img.URL,
				Description: img.Description,
				IsPrimary:   img.IsPrimary,
			}
		}
		items = append(items, listPlaceItem{
			ID:       p.ID.String(),
			Name:     p.Name,
			Category: p.Category,
			Images:   images,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(listPlacesResponse{Places: items})
}

func parseListPlacesRequest(w http.ResponseWriter, r *http.Request) (listPlacesRequest, bool) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("long"), 64)
	category := r.URL.Query().Get("category")

	if category == "" {
		http.Error(w, "category is required", http.StatusBadRequest)
		return listPlacesRequest{}, false
	}

	return listPlacesRequest{
		Lat:      lat,
		Long:     long,
		Category: category,
	}, true
}
