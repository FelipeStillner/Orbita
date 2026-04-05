package types

import "github.com/google/uuid"

type Place struct {
	ID           uuid.UUID // set after upsert into place (search / OSM)
	Name         string
	Description  string
	Category     string
	Lat          float64
	Long         float64
	WikidataID   string
	Tags         []string
	OpeningHours string
}
