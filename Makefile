# --- Docker / Database ---

# Start the database container in the background
db-up:
	docker-compose up -d

# Stop the database container
db-down:
	docker-compose down

# Apply the schema
db-schema:
	cat database/schema/*.sql | docker exec -i orbita_db psql -U orbita_user -d orbita_db

# Insert the fake data
db-seed:
	cat database/seeds/basic_data.sql | docker exec -i orbita_db psql -U orbita_user -d orbita_db

# Reset everything (Stop -> Start -> Schema -> Seed)
db-reset:
	docker-compose down -v
	docker-compose up -d
	@echo "Waiting for DB to start..."
	@sleep 3
	make db-schema
	make db-seed

# --- Code Generation ---

# Generate Go code from SQL queries using sqlc
generate:
	sqlc generate

# --- Application ---

# Run React in Dev Mode
dev-web:
	cd web && npm run dev

# Run Go Server in Dev Mode
dev-server:
	go run cmd/server/main.go

# Build everything
build:
	cd web && npm run build
	go build -o bin/orbita cmd/server/main.go

run: build
	./bin/orbita
