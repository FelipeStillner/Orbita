package types

import "github.com/google/uuid"

type PlaceImage struct {
	URL         string
	Description string
	IsPrimary   bool
}

type CollectionItem struct {
	ID   uuid.UUID
	Name string
}

type Result struct {
	ID              uuid.UUID
	Name            string
	Latitude        float64
	Longitude       float64
	Images          []PlaceImage
	Description     string
	Category        string
	Liked           bool
	Collections     []CollectionItem
	Tags            []string
	OpeningHours    string
	LikeCount       int32
	SaveCount       int32
	HideCount       int32
	DistanceMeters  *float64
	IsOpenNow       *bool
}
