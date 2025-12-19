package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq" // Postgres driver

	"github.com/FelipeStillner/Orbita/internal/database" // Code sqlc generates
	"github.com/FelipeStillner/Orbita/web"
)

func main() {
	// .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("No .env file found, relying on system environment variables")
	}

	// database
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Could not open DB connection:", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatal("Could not ping DB:", err)
	}

	// sqlc
	queries := database.New(db)

	// api
	mux := http.NewServeMux()
	mux.HandleFunc("/api/places", handleGetPlaces(queries))

	// frontend
	assets, _ := web.GetFileSystem()
	mux.Handle("/", http.FileServer(http.FS(assets)))

	// run
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("🪐 Orbita Server starting on http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}

// handleGetPlaces handles GET /api/places?lat=X&long=Y
func handleGetPlaces(q *database.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		latStr := r.URL.Query().Get("lat")
		lonStr := r.URL.Query().Get("long")

		lat, err1 := strconv.ParseFloat(latStr, 64)
		lon, err2 := strconv.ParseFloat(lonStr, 64)

		if err1 != nil || err2 != nil {
			http.Error(w, "Invalid lat/long parameters", http.StatusBadRequest)
			return
		}

		places, err := q.GetNearbyPlaces(r.Context(), database.GetNearbyPlacesParams{
			Lon:          lon,
			Lat:          lat,
			RadiusMeters: 5000, // Search within 5km
		})
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		response := map[string]any{
			"type":     "FeatureCollection",
			"features": formatFeatures(places),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

// Helper to convert DB rows into GeoJSON Features
func formatFeatures(rows []database.GetNearbyPlacesRow) []map[string]any {
	features := []map[string]any{}

	for _, row := range rows {
		feature := map[string]any{
			"type":     "Feature",
			"geometry": row.Geojson, // PostGIS gave us this directly!
			"properties": map[string]any{
				"id":          row.ID,
				"name":        row.Name,
				"category":    row.Category,
				"description": row.Description,
			},
		}
		features = append(features, feature)
	}
	return features
}
