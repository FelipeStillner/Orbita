package place

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) ensureAreaScanned(ctx context.Context, lat, long float64) error {
	key := fmt.Sprintf("ensure_area_%.3f,%.3f", lat, long)
	_, err, _ := s.g.Do(key, func() (any, error) {
		isScanned, err := s.queries.IsAreaScanned(ctx, database.IsAreaScannedParams{Lat: lat, Long: long})
		if err != nil {
			return nil, fmt.Errorf("failed to check if area is scanned: %w", err)
		}
		if !isScanned {
			if err := s.fetchArea(ctx, lat, long); err != nil {
				return nil, fmt.Errorf("failed to fetch area: %w", err)
			}
		}
		return nil, nil
	})
	return err
}

func (s *Service) fetchArea(ctx context.Context, lat, long float64) error {
	places, err := s.osm.FetchPlaces(lat, long, 5000)
	if err != nil {
		return fmt.Errorf("OSM fetch error: %w", err)
	}

	if len(places) == 0 {
		return s.queries.LogScan(ctx, database.LogScanParams{Lat: lat, Long: long, RadiusKm: 5.0})
	}

	var (
		names            []string
		descriptions     []string
		categories       []string
		lons             []float64
		lats             []float64
		wikidataIDs      []string
		tagsJSON         []string
		openingHoursList []string
	)

	for _, p := range places {
		names = append(names, p.Name)
		descriptions = append(descriptions, p.Description)
		categories = append(categories, p.Category)
		lons = append(lons, p.Long)
		lats = append(lats, p.Lat)
		wikidataIDs = append(wikidataIDs, p.WikidataID)
		raw, _ := json.Marshal(p.Tags)
		tagsJSON = append(tagsJSON, string(raw))
		openingHoursList = append(openingHoursList, p.OpeningHours)
	}

	placeIDs, err := s.queries.CreatePlacesBatch(ctx, database.CreatePlacesBatchParams{
		Names:            names,
		Descriptions:     descriptions,
		Categories:       categories,
		Longs:            lons,
		Lats:             lats,
		Tags:             tagsJSON,
		OpeningHoursList: openingHoursList,
	})
	if err != nil {
		return fmt.Errorf("batch insert error: %w", err)
	}

	type imageResult struct {
		PlaceID uuid.UUID
		URLs    []string
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
			urls, err := s.wikidata.FetchImageURLs(wid)
			if err == nil && len(urls) > 0 {
				imgResultsChan <- imageResult{PlaceID: pid, URLs: urls}
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
		for i, url := range res.URLs {
			imgPlaceIDs = append(imgPlaceIDs, res.PlaceID)
			imgURLs = append(imgURLs, url)
			imgDescs = append(imgDescs, "Wikidata Source")
			imgIsPrimaries = append(imgIsPrimaries, i == 0)
		}
	}

	if len(imgURLs) > 0 {
		if err := s.queries.AddPlaceImagesBatch(ctx, database.AddPlaceImagesBatchParams{
			PlaceIds:     imgPlaceIDs,
			Urls:         imgURLs,
			Descriptions: imgDescs,
			IsPrimaries:  imgIsPrimaries,
		}); err != nil {
			return fmt.Errorf("batch insert images: %w", err)
		}
	}

	return s.queries.LogScan(ctx, database.LogScanParams{Lat: lat, Long: long, RadiusKm: 5.0})
}
