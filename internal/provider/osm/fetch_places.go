package osm

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/FelipeStillner/Orbita/internal/service/place/types"
)

const overpassUserAgent = "OrbitaPlaceApp/1.0 (https://github.com/FelipeStillner/Orbita)"

var overpassEndpoints = []string{
	"https://overpass-api.de/api/interpreter",
	"https://overpass.kumi.systems/api/interpreter",
}

func (c *placeProvider) FetchPlaces(lat, long float64, radiusMeters int) ([]types.Place, error) {
	query := fmt.Sprintf(templateQuery, radiusMeters, lat, long)
	body := url.Values{"data": {query}}.Encode()

	var lastErr error
	for _, baseURL := range overpassEndpoints {
		places, err := c.fetchPlacesFrom(baseURL, body)
		if err == nil {
			return places, nil
		}
		lastErr = err
	}
	return nil, fmt.Errorf("all Overpass endpoints failed: %w", lastErr)
}

func (c *placeProvider) fetchPlacesFrom(baseURL, formBody string) ([]types.Place, error) {
	req, err := http.NewRequest(http.MethodPost, baseURL, strings.NewReader(formBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("User-Agent", overpassUserAgent)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("overpass read body: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("overpass returned %d: %s", resp.StatusCode, truncate(string(body), 300))
	}
	if len(body) > 0 && body[0] != '{' && body[0] != '[' {
		return nil, fmt.Errorf("overpass returned non-JSON: %s", truncate(string(body), 300))
	}

	var result osmResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("overpass invalid JSON: %w", err)
	}
	return toPlaces(&result), nil
}

func truncate(s string, max int) string {
	s = strings.TrimSpace(s)
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}

var osmTagKeys = []string{"amenity", "tourism", "historic", "cuisine", "leisure", "shop"}

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

	return places
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
