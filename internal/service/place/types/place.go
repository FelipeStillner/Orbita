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

type CollectionItem struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type Result struct {
	ID          uuid.UUID
	Name        string
	Latitude    float64
	Longitude   float64
	Images      any
	Description string
	Category    string
	Liked       bool
	Collections []CollectionItem
}
