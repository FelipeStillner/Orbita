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
			  // --- FOOD (1km Radius) ---
			  // Only "Restaurants". We removed Cafes and Bars to reduce noise.
			  node["amenity"="restaurant"]["name"](around:2000,%[1]f,%[2]f);

			  // --- MAJOR TOURISM (5km Radius + Wikipedia Required) ---
			  // We removed "viewpoint", "attraction", "memorial", "artwork".
			  // We only keep buildings that people pay to enter.
			  node["tourism"~"museum|zoo|theme_park|aquarium"]["wikipedia"](around:10000,%[1]f,%[2]f);

			  // --- HISTORY (5km Radius + Wikipedia Required) ---
			  // Only physical structures.
			  node["historic"~"castle|ruins|fort|archaeological_site"]["wikipedia"](around:10000,%[1]f,%[2]f);

			  // --- RELIGION (5km Radius + Wikipedia Required) ---
			  // Only Cathedrals (ignore small chapels)
			  node["building"="cathedral"]["wikipedia"](around:10000,%[1]f,%[2]f);
			);
			out body;
		`
