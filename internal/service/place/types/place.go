package types

import (
	"io"

	"github.com/google/uuid"
)

type Place struct {
	Name        string
	Description string
	Category    string
	Lat         float64
	Long        float64
	WikidataID  string
}

type CreateParams struct {
	Name        string
	Description string
	Category    string
	Lat         float64
	Long        float64
	Images      []ImageUpload
}

type ImageUpload struct {
	Filename string
	Data     io.Reader
}

type Result struct {
	ID      uuid.UUID
	Name    string
	GeoJSON any
	Images  any
}
