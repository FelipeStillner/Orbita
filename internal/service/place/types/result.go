package types

import "github.com/google/uuid"

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
