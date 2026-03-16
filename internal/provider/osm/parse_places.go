package osm

import (
	"encoding/json"
	"fmt"

	"github.com/FelipeStillner/Orbita/internal/service/place/types"
)

var osmTagKeys = []string{"amenity", "tourism", "historic", "cuisine", "leisure", "shop"}

func (c *placeProvider) parsePlaces(resBody []byte) ([]types.Place, error) {
	var result osmResponse
	if err := json.Unmarshal(resBody, &result); err != nil {
		return nil, fmt.Errorf("overpass invalid JSON: %w", err)
	}
	var places []types.Place

	for _, e := range result.Elements {
		name := e.Tags["name"]
		if name == "" {
			continue
		}

		lat := e.Lat
		lon := e.Lon

		if lat == 0 && lon == 0 && e.Center != nil {
			lat = e.Center.Lat
			lon = e.Center.Lon
		}

		if lat == 0 && lon == 0 {
			continue
		}

		category := "General"
		if t, ok := e.Tags["tourism"]; ok {
			category = t
		} else if a, ok := e.Tags["amenity"]; ok {
			category = a
		} else if h, ok := e.Tags["historic"]; ok {
			category = h
		}

		tags := tagsFromElement(e.Tags)
		openingHours := e.Tags["opening_hours"]

		places = append(places, types.Place{
			Name:         name,
			Description:  "Imported from OpenStreetMap",
			Category:     category,
			Lat:          lat,
			Long:         lon,
			WikidataID:   e.Tags["wikidata"],
			Tags:         tags,
			OpeningHours: openingHours,
		})
	}

	return places, nil
}

func tagsFromElement(tags map[string]string) []string {
	var out []string
	for _, key := range osmTagKeys {
		if v, ok := tags[key]; ok && v != "" {
			out = append(out, key+":"+v)
		}
	}
	return out
}
