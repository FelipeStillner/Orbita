package place

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/FelipeStillner/Orbita/internal/auth"
)

type listCategoriesRequest struct {
	Lat  float64
	Long float64
}

type listCategoriesResponse struct {
	Categories []listCategoriesCategory `json:"categories"`
}

type listCategoriesCategory struct {
	Category string                `json:"category"`
	Places   []listCategoriesPlace `json:"places"`
}

type listCategoriesPlace struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Category       string   `json:"category"`
	Image          string   `json:"image"`
	Latitude       float64  `json:"latitude"`
	Longitude      float64  `json:"longitude"`
	DistanceMeters float64  `json:"distance_meters"`
	LikeCount      int32    `json:"like_count"`
	Tags           []string `json:"tags,omitempty"`
	PhotoCount     int      `json:"photo_count"`
	IsOpenNow      *bool    `json:"is_open_now,omitempty"`
}

func (h *handler) handleListCategories(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromRequestOptional(w, r)
	req, ok := parseListCategoriesRequest(r)
	if !ok {
		return
	}

	ctx := r.Context()
	categories, err := h.service.ListCategories(ctx, userID, req.Lat, req.Long)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	sections := make([]listCategoriesCategory, 0, len(categories))
	for _, cp := range categories {
		items := make([]listCategoriesPlace, 0, len(cp.Places))
		for _, p := range cp.Places {
			image := ""
			if len(p.Images) > 0 {
				image = p.Images[0].URL
			}
			dm := 0.0
			if p.DistanceMeters != nil {
				dm = *p.DistanceMeters
			}
			items = append(items, listCategoriesPlace{
				ID:             p.ID.String(),
				Name:           p.Name,
				Category:       p.Category,
				Image:          image,
				Latitude:       p.Latitude,
				Longitude:      p.Longitude,
				DistanceMeters: dm,
				LikeCount:      p.LikeCount,
				Tags:           p.Tags,
				PhotoCount:     len(p.Images),
				IsOpenNow:      p.IsOpenNow,
			})
		}
		sections = append(sections, listCategoriesCategory{Category: cp.Category, Places: items})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(listCategoriesResponse{Categories: sections})
}

func parseListCategoriesRequest(r *http.Request) (listCategoriesRequest, bool) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	long, _ := strconv.ParseFloat(r.URL.Query().Get("long"), 64)
	return listCategoriesRequest{Lat: lat, Long: long}, true
}
