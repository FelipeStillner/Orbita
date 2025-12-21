package osm

import (
	"encoding/json"
	"fmt"
	"net/url"
)

func (c *Client) FetchPlaces(lat, long float64, radiusMeters int) (*OSMResponse, error) {
	query := fmt.Sprintf(templateQuery, lat, long)

	resp, err := c.httpClient.PostForm(overpassURL, url.Values{"data": {query}})
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result OSMResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

const overpassURL = "https://overpass-api.de/api/interpreter"

const templateQuery = `
	[out:json][timeout:25];
	(
	  // --- TOURISM & ARTS ---
	  nwr["tourism"~"museum|gallery|viewpoint|attraction|zoo|theme_park|aquarium"]["wikidata"](around:10000,%[1]f,%[2]f);

	  // --- PERFORMING ARTS (Operas, Theaters) ---
	  nwr["amenity"~"theatre|arts_centre|planetarium"]["wikidata"](around:10000,%[1]f,%[2]f);

	  // --- HISTORY & MONUMENTS ---
	  nwr["historic"]["wikidata"](around:10000,%[1]f,%[2]f);

	  // --- RELIGION (Cathedrals) ---
	  nwr["building"="cathedral"](around:10000,%[1]f,%[2]f);

	  // --- PUBLIC SPACES (Squares/Plazas) ---
	  nwr["place"="square"]["wikidata"](around:10000,%[1]f,%[2]f);
	);
	out center;
`
