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
	ID       string `json:"id"`
	Name     string `json:"name"`
	Category string `json:"category"`
	Image    string `json:"image"`
}

func (h *handler) handleListCategories(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
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
			items = append(items, listCategoriesPlace{
				ID:       p.ID.String(),
				Name:     p.Name,
				Category: p.Category,
				Image:    image,
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
