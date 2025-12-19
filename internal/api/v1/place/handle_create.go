package place

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/FelipeStillner/Orbita/internal/service/place"
)

func (h *handler) handleCreate(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "File too big", http.StatusBadRequest)
		return
	}

	lat, _ := strconv.ParseFloat(r.FormValue("lat"), 64)
	long, _ := strconv.ParseFloat(r.FormValue("long"), 64)

	var imageFiles []place.ImageUpload
	for _, f := range r.MultipartForm.File["images"] {
		file, err := f.Open()
		if err == nil {
			imageFiles = append(imageFiles, place.ImageUpload{
				Filename: f.Filename,
				Data:     file,
			})
			defer file.Close()
		}
	}

	params := place.CreateParams{
		Name:        r.FormValue("name"),
		Description: r.FormValue("description"),
		Category:    r.FormValue("category"),
		Lat:         lat,
		Long:        long,
		Images:      imageFiles,
	}

	id, err := h.service.Create(r.Context(), params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id})
}
