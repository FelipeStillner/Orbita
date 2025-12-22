package place

import (
	"context"
	"fmt"
	"sync"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) List(ctx context.Context, lat, long float64, limit, offset int32) ([]Result, error) {
	key := fmt.Sprintf("list_%.3f,%.3f", lat, long)

	_, err, _ := s.g.Do(key, func() (any, error) {
		isScanned, err := s.queries.IsAreaScanned(ctx, database.IsAreaScannedParams{
			Lat:  lat,
			Long: long,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to check if area is scanned: %w", err)
		}

		if !isScanned {
			err := s.fetchArea(ctx, lat, long)
			if err != nil {
				return nil, fmt.Errorf("failed to fetch new data: %w", err)
			}
		}
		return nil, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %w", err)
	}

	// 3. Query Database
	rows, err := s.queries.ListPlaces(ctx, database.ListPlacesParams{
		Lat:          lat,
		Lon:          long,
		RadiusMeters: 3000,
		Limit:        limit,
		Offset:       offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %w", err)
	}

	results := make([]Result, len(rows))
	for i, row := range rows {
		results[i] = Result{
			ID:      row.ID,
			Name:    row.Name,
			GeoJSON: row.Geojson,
			Images:  row.Images,
		}
	}

	return results, nil
}

func (s *Service) fetchArea(ctx context.Context, lat, long float64) error {
	osmData, err := s.osm.FetchPlaces(lat, long, 5000)
	if err != nil {
		return fmt.Errorf("OSM fetch error: %w", err)
	}

	if len(osmData.Elements) == 0 {
		return nil
	}

	var (
		names        []string
		descriptions []string
		categories   []string
		lons         []float64
		lats         []float64
		wikidataIDs  []string
	)

	for _, element := range osmData.Elements {
		name := element.Tags["name"]
		if name == "" {
			continue
		}

		lat := element.Lat
		lon := element.Lon

		if lat == 0 && lon == 0 && element.Center != nil {
			lat = element.Center.Lat
			lon = element.Center.Lon
		}

		if lat == 0 && lon == 0 {
			continue
		}

		cat := "General"
		if t, ok := element.Tags["tourism"]; ok {
			cat = t
		} else if a, ok := element.Tags["amenity"]; ok {
			cat = a
		}

		names = append(names, name)
		descriptions = append(descriptions, "Imported from OpenStreetMap")
		categories = append(categories, cat)

		lons = append(lons, lon)
		lats = append(lats, lat)

		wikidataIDs = append(wikidataIDs, element.Tags["wikidata"])
	}

	placeIDs, err := s.queries.CreatePlacesBatch(ctx, database.CreatePlacesBatchParams{
		Names:        names,
		Descriptions: descriptions,
		Categories:   categories,
		Longs:        lons,
		Lats:         lats,
	})
	if err != nil {
		return fmt.Errorf("batch insert error: %w", err)
	}

	type imageResult struct {
		PlaceID uuid.UUID
		URL     string
	}

	imgResultsChan := make(chan imageResult, len(placeIDs))
	var wg sync.WaitGroup

	for i, placeID := range placeIDs {
		wikiID := wikidataIDs[i]
		if wikiID == "" {
			continue
		}

		wg.Add(1)
		go func(pid uuid.UUID, wid string) {
			defer wg.Done()
			url, err := s.wikidata.FetchImageURL(wid)
			if err == nil && url != "" {
				imgResultsChan <- imageResult{PlaceID: pid, URL: url}
			}
		}(placeID, wikiID)
	}

	go func() {
		wg.Wait()
		close(imgResultsChan)
	}()

	var (
		imgPlaceIDs    []uuid.UUID
		imgURLs        []string
		imgDescs       []string
		imgIsPrimaries []bool
	)

	for res := range imgResultsChan {
		imgPlaceIDs = append(imgPlaceIDs, res.PlaceID)
		imgURLs = append(imgURLs, res.URL)
		imgDescs = append(imgDescs, "Wikidata Source")
		imgIsPrimaries = append(imgIsPrimaries, true)
	}

	if len(imgURLs) > 0 {
		err = s.queries.AddPlaceImagesBatch(ctx, database.AddPlaceImagesBatchParams{
			PlaceIds:     imgPlaceIDs,
			Urls:         imgURLs,
			Descriptions: imgDescs,
			IsPrimaries:  imgIsPrimaries,
		})
		if err != nil {
			fmt.Printf("failed to batch insert images: %v\n", err)
		}
	}

	err = s.queries.LogScan(ctx, database.LogScanParams{
		Lat:      lat,
		Long:     long,
		RadiusKm: 5.0,
	})

	return err
}
