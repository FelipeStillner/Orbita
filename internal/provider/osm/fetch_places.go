package osm

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/FelipeStillner/Orbita/internal/service/place/types"
	"github.com/FelipeStillner/Orbita/internal/shared/strx"
)

const overpassUserAgent = "OrbitaPlaceApp/1.0 (https://github.com/FelipeStillner/Orbita)"

var overpassEndpoints = "https://overpass-api.de/api/interpreter"

const templateQueryBbox = `
	[out:json][timeout:60];
	(
	    nwr["tourism"~"museum|gallery|viewpoint|attraction|zoo|theme_park|aquarium"]["wikidata"](%[1]f,%[2]f,%[3]f,%[4]f);

		nwr["amenity"~"theatre|arts_centre|planetarium"]["wikidata"](%[1]f,%[2]f,%[3]f,%[4]f);

		nwr["historic"]["wikidata"](%[1]f,%[2]f,%[3]f,%[4]f);

		nwr ["building"="cathedral"]["wikidata"](%[1]f,%[2]f,%[3]f,%[4]f);

		nwr ["place"="square"]["wikidata"](%[1]f,%[2]f,%[3]f,%[4]f);
	);
	out center;
`

func (c *placeProvider) FetchPlaces(latS, lonW, latN, lonE float64) ([]types.Place, error) {
	query := fmt.Sprintf(templateQueryBbox, latS, lonW, latN, lonE)

	var lastErr error
	for attempt := 0; attempt < 2; attempt++ {
		if attempt > 0 {
			time.Sleep(2 * time.Second)
		}
		reqBody := url.Values{"data": {query}}.Encode()
		req, err := http.NewRequest(http.MethodPost, overpassEndpoints, strings.NewReader(reqBody))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Set("User-Agent", overpassUserAgent)

		resp, err := c.httpClient.Do(req)
		if err != nil {
			return nil, err
		}
		resBody, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			return nil, fmt.Errorf("overpass read body: %w", err)
		}

		if resp.StatusCode != http.StatusOK {
			lastErr = fmt.Errorf("overpass returned %d: %s", resp.StatusCode, strx.Truncate(string(resBody), 300))
			// Public Overpass often returns 502/504 when overloaded; one retry can succeed.
			if (resp.StatusCode == http.StatusBadGateway || resp.StatusCode == http.StatusGatewayTimeout) && attempt == 0 {
				continue
			}
			return nil, lastErr
		}
		if len(resBody) > 0 && resBody[0] != '{' && resBody[0] != '[' {
			return nil, fmt.Errorf("overpass returned non-JSON: %s", strx.Truncate(string(resBody), 300))
		}

		places, err := c.parsePlaces(resBody)
		if err != nil {
			return nil, fmt.Errorf("overpass parse places: %w", err)
		}
		return places, nil
	}
	return nil, lastErr
}
