package osm

import (
	"encoding/json"
	"fmt"
	"net/url"

	"github.com/FelipeStillner/Orbita/internal/service/place/types"
)

func (c *placeProvider) FetchPlaces(lat, long float64, radiusMeters int) ([]types.Place, error) {
	query := fmt.Sprintf(templateQuery, radiusMeters, lat, long)

	resp, err := c.httpClient.PostForm(overpassURL, url.Values{"data": {query}})
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result osmResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return toPlaces(&result), nil
}

func toPlaces(osmResp *osmResponse) []types.Place {
	var places []types.Place

	for _, e := range osmResp.Elements {
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
		}

		places = append(places, types.Place{
			Name:        name,
			Description: "Imported from OpenStreetMap",
			Category:    category,
			Lat:         lat,
			Long:        lon,
			WikidataID:  e.Tags["wikidata"],
		})
	}

	return places
}

const overpassURL = "https://overpass-api.de/api/interpreter"

const templateQuery = `
	[out:json][timeout:25];
	(
	  // --- TOURISM & ARTS ---
	  nwr["tourism"~"museum|gallery|viewpoint|attraction|zoo|theme_park|aquarium"]["wikidata"](around:%[1]d,%[2]f,%[3]f);

	  // --- PERFORMING ARTS ---
	  nwr["amenity"~"theatre|arts_centre|planetarium"]["wikidata"](around:%[1]d,%[2]f,%[3]f);

	  // --- HISTORY & MONUMENTS ---
	  nwr["historic"]["wikidata"](around:%[1]d,%[2]f,%[3]f);

	  // --- RELIGION ---
	  nwr["building"="cathedral"](around:%[1]d,%[2]f,%[3]f);

	  // --- PUBLIC SPACES ---
	  nwr["place"="square"]["wikidata"](around:%[1]d,%[2]f,%[3]f);
	);
	out center;
`
