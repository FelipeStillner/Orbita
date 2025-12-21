package place

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"github.com/FelipeStillner/Orbita/internal/adapter/osm"
	"github.com/FelipeStillner/Orbita/internal/database"
)

func (s *Service) ListNearby(ctx context.Context, lat, long float64, limit, offset int32) ([]Result, error) {
	// 1. Smart Cache Check: 2 km radius
	isScanned, err := s.queries.IsAreaScanned(ctx, database.IsAreaScannedParams{
		Lat:  lat,
		Long: long,
	})
	if err != nil {
		fmt.Println("Error checking scan status: ", err)
	}

	// 2. Fetch fresh data
	if !isScanned {
		if err := s.fetchArea(ctx, lat, long); err != nil {
			return nil, fmt.Errorf("Failed to fetch new data: %w", err)
		}
	}

	// 3. Query Database with Limit and Offset
	rows, err := s.queries.GetNearbyPlaces(ctx, database.GetNearbyPlacesParams{
		Lat:          lat,
		Lon:          long,
		RadiusMeters: 5000,
		Limit:        limit,
		Offset:       offset,
	})
	if err != nil {
		return nil, fmt.Errorf("Failed to query database: %w", err)
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
	// 1. Fetch radius of 10000 meters
	osmData, err := s.osm.FetchPlaces(lat, long, 10000)
	if err != nil {
		return fmt.Errorf("OSM Fetch Error: %w", err)
	}

	// 2. Create Places from OSM Data
	for _, element := range osmData.Elements {
		s.createPlace(ctx, element)
	}

	// 3. Mark this area as scanned
	err = s.queries.LogScan(ctx, database.LogScanParams{
		Lat:      lat,
		Long:     long,
		RadiusKm: 1.0,
	})
	if err != nil {
		return fmt.Errorf("Failed to log scan: %w", err)
	}

	return nil
}

func (s *Service) createPlace(ctx context.Context, element osm.Element) {
	name := element.Tags["name"]
	if name == "" {
		return
	}

	category := "General"
	if t, ok := element.Tags["tourism"]; ok {
		category = t
	} else if a, ok := element.Tags["amenity"]; ok {
		category = a
	}

	placeID, err := s.queries.CreatePlace(ctx, database.CreatePlaceParams{
		Name:        name,
		Description: sql.NullString{String: "Imported from OpenStreetMap", Valid: true},
		Category:    category,
		Column4:     element.Lon,
		Column5:     element.Lat,
	})

	if err != nil {
		log.Printf("Failed to insert place %s: %v", name, err)
		return
	}

	if wikidataID, ok := element.Tags["wikidata"]; ok {
		imageURL, err := s.wikidata.FetchImageURL(wikidataID)

		if err == nil && imageURL != "" {
			err = s.queries.AddPlaceImage(ctx, database.AddPlaceImageParams{
				PlaceID:     placeID,
				Url:         imageURL,
				Description: sql.NullString{String: "Wikidata Source", Valid: true},
				IsPrimary:   sql.NullBool{Bool: true, Valid: true},
			})

			if err != nil {
				log.Printf("Failed to save image for %s: %v", name, err)
			} else {
				log.Printf("Saved image for %s", name)
			}
		}
	}
}
