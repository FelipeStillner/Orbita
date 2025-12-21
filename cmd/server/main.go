package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"github.com/FelipeStillner/Orbita/internal/api"
	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/FelipeStillner/Orbita/web"
)

func main() {
	// .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("No .env file found: ", err)
	}

	// database
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL is required")
	}
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatal("Could not ping DB:", err)
	}

	// sqlc
	queries := database.New(db)

	// api
	server := api.NewServer(queries)

	// frontend
	assets, err := web.GetFileSystem()
	if err != nil {
		log.Fatal("Failed to load frontend assets: ", err)
	}

	// SPA Handler Logic
	fileServer := http.FileServer(http.FS(assets))

	spaHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")

		if path == "" {
			path = "index.html"
		}

		f, err := assets.Open(path)
		if err != nil {
			r.URL.Path = "/"
			fileServer.ServeHTTP(w, r)
			return
		}

		f.Close()
		fileServer.ServeHTTP(w, r)
	})

	server.Router.Handle("/", spaHandler)

	// run
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Orbita Server ready on http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, server); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
