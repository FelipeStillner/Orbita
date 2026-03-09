package place

import (
	"context"
	"fmt"
	"sync"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/internal/service/place/types"
	"github.com/google/uuid"
)

func (s *Service) List(ctx context.Context, userId uuid.UUID, lat, long float64, limit, offset int32) ([]types.Result, error) {
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
		UserID:       userId,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %w", err)
	}

	placeIDs := make([]uuid.UUID, len(rows))
	for i, row := range rows {
		placeIDs[i] = row.ID
	}

	var imagesByPlace map[uuid.UUID][]types.PlaceImage
	if len(placeIDs) > 0 {
		imageRows, err := s.queries.ListPlaceImagesByPlaceIDs(ctx, placeIDs)
		if err != nil {
			return nil, fmt.Errorf("failed to list place images: %w", err)
		}
		imagesByPlace = make(map[uuid.UUID][]types.PlaceImage)
		for _, r := range imageRows {
			img := types.PlaceImage{
				URL:         r.Url,
				Description: r.Description.String,
				IsPrimary:   r.IsPrimary.Bool,
			}
			imagesByPlace[r.PlaceID] = append(imagesByPlace[r.PlaceID], img)
		}
	}

	var collectionsByPlace map[uuid.UUID][]types.CollectionItem
	if len(placeIDs) > 0 {
		collectionRows, err := s.queries.ListCollectionItemsByPlaceIDs(ctx, database.ListCollectionItemsByPlaceIDsParams{
			UserID:   userId,
			PlaceIds: placeIDs,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to list collection items: %w", err)
		}
		collectionsByPlace = make(map[uuid.UUID][]types.CollectionItem)
		for _, r := range collectionRows {
			collectionsByPlace[r.PlaceID] = append(collectionsByPlace[r.PlaceID], types.CollectionItem{
				ID:   r.CollectionID,
				Name: r.Name,
			})
		}
	}

	results := make([]types.Result, len(rows))
	for i, row := range rows {
		var images []types.PlaceImage
		if imagesByPlace != nil {
			images = imagesByPlace[row.ID]
		}
		var collections []types.CollectionItem
		if collectionsByPlace != nil {
			collections = collectionsByPlace[row.ID]
		}
		results[i] = types.Result{
			ID:          row.ID,
			Name:        row.Name,
			Latitude:    row.Latitude,
			Longitude:   row.Longitude,
			Images:      images,
			Description: row.Description.String,
			Category:    row.Category,
			Liked:       row.Liked,
			Collections: collections,
		}
	}

	return results, nil
}

func (s *Service) fetchArea(ctx context.Context, lat, long float64) error {
	places, err := s.osm.FetchPlaces(lat, long, 5000)
	if err != nil {
		return fmt.Errorf("OSM fetch error: %w", err)
	}

	if len(places) == 0 {
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

	for _, p := range places {
		names = append(names, p.Name)
		descriptions = append(descriptions, p.Description)
		categories = append(categories, p.Category)
		lons = append(lons, p.Long)
		lats = append(lats, p.Lat)
		wikidataIDs = append(wikidataIDs, p.WikidataID)
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
