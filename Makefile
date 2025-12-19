# --- Docker / Database ---

# Start the database container in the background
db-up:
	docker-compose up -d

# Stop the database container
db-down:
	docker-compose down

# Apply the schema
db-schema:
	cat internal/database/schema/*.sql | docker exec -i orbita_db psql -U orbita_user -d orbita_db

# Insert the fake data
db-seed:
	docker exec -i orbita_db psql -U orbita_user -d orbita_db -c "\
	INSERT INTO places (name, description, category, location) \
	VALUES ('Orbita HQ', 'The birthplace of the project', 'office', ST_SetSRID(ST_MakePoint(-9.139, 38.722), 4326));"

# Reset everything (Stop -> Start -> Schema -> Seed)
db-reset: db-down db-up
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
