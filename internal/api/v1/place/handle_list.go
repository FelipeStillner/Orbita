package place

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/FelipeStillner/Orbita/internal/auth"
)

type listRequest struct {
	Lat    float64
	Long   float64
	Limit  int32
	Offset int32
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

type listResponse struct {
	Places []listPlaceItem `json:"places"`
	Meta   struct {
		Page  int `json:"page"`
		Limit int `json:"limit"`
	} `json:"meta"`
}

func (h *handler) handleList(w http.ResponseWriter, r *http.Request) {
	// Handle the Request Structure
	userID, ok := auth.UserIDFromRequest(w, r)
	if !ok {
		return
	}
	req, ok := parseListRequest(w, r)
	if !ok {
		return
	}

	// Application Logic
	ctx := r.Context()
	places, err := h.service.List(ctx, userID, req.Lat, req.Long, req.Limit, req.Offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle the Response
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
	page := int(req.Offset/req.Limit) + 1
	resp := listResponse{
		Places: items,
		Meta: struct {
			Page  int `json:"page"`
			Limit int `json:"limit"`
		}{
			Page:  page,
			Limit: int(req.Limit),
		},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func parseListRequest(w http.ResponseWriter, r *http.Request) (listRequest, bool) {
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
	return listRequest{
		Lat:    lat,
		Long:   long,
		Limit:  int32(limit),
		Offset: int32(offset),
	}, true
}
