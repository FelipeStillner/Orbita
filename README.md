# Orbita

A location-based discovery app that shows you places nearby. Sign in with Google, browse places by category (from OpenStreetMap), like or save spots, and organize them in collections.

## Features

- **Location-based discovery** — Places near you, grouped by category
- **Place details** — View info, open in maps, like, or save to collections
- **Collections** — Create lists and add places (e.g. “Want to go”, “Favorites”)
- **Google Sign-in** — OAuth + JWT for authenticated sessions
- **Responsive web app** — React SPA with map integration (Leaflet)

## Tech Stack


| Layer        | Stack                                                                   |
| ------------ | ----------------------------------------------------------------------- |
| **Backend**  | Go 1.25, `net/http`, [sqlc](https://sqlc.dev/), PostgreSQL              |
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS                              |
| **Auth**     | Google OAuth, JWT                                                       |
| **Data**     | Places from OpenStreetMap; optional enrichment (e.g. Wikidata)          |
| **Storage**  | PostgreSQL                                                              |
| **Deploy**   | Single binary serves API + static frontend; GitHub Actions → SSH deploy |


## Prerequisites

- **Go** 1.25+
- **Node.js** 18+ (for frontend dev/build)
- **Docker** (for local Database)
- **sqlc** ([install](https://docs.sqlc.dev/en/latest/overview/install.html))
- **Google Cloud** — OAuth client

## Quick Start

### 1. Environment

Copy the dev env and set your values:

```bash
cp envs/dev.env .env
```

Edit `.env` and set at least:

- `DATABASE_URL` — used by the Go server (see below)
- `JWT_SECRET` — any long random string for production
- `GOOGLE_CLIENT_ID` — Google OAuth client ID for sign-in

For the web app (dev), create `web/.env` with:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Optional: `GCS_BUCKET_NAME` if you use GCS for uploads.

### 2. Database

Start PostGIS and apply schema:

```bash
make db-up
make db-schema
# optional: make db-seed
```

`envs/dev.env` uses:

- Host: `localhost`, Port: `5432`
- User: `orbita_user`, Password: `orbita_pass`, DB: `orbita_db`

So `DATABASE_URL` in `.env` should match (e.g. `postgres://orbita_user:orbita_pass@localhost:5432/orbita_db?sslmode=disable`).

### 3. Generate and run

```bash
make generate   # sqlc
make run        # build + ./bin/orbita
```

App: **[http://localhost:8080](http://localhost:8080)**

## Development

- **Backend only:** `make dev-server` (Go server; expects DB and built or proxied frontend)
- **Frontend only:** `make dev-web` (Vite dev server)
- **DB:** `make db-reset` — recreate DB and re-apply schema

After changing SQL under `database/`, run:

```bash
make generate
```

## Project Structure

```
Orbita/
├── cmd/server/          # Go entrypoint; DB, auth, API, SPA handler
├── internal/
│   ├── api/             # HTTP routes and handlers (auth, place, collection, health)
│   ├── auth/            # JWT, Google token verification, middleware
│   ├── database/        # sqlc-generated code (do not edit by hand)
│   ├── provider/        # osm, wikidata, gcs
│   └── service/         # place & collection use cases
├── database/
│   ├── schema/          # PostgreSQL DDL
│   ├── queries/         # SQL for sqlc
│   └── seeds/           # Optional seed data
├── web/                 # React + Vite app (embedded in binary when built)
├── envs/                # Example env (e.g. dev.env)
├── docker-compose.yml   # PostGIS service
├── sqlc.yaml            # sqlc config
└── Makefile             # db, generate, build, run, dev targets
```

## Deployment

Push to the `prod` branch to trigger **Deploy to GCP** (`.github/workflows/deploy.yml`). The workflow SSHs to the server, pulls code, builds the frontend and Go binary, then restarts the `orbita` process. Ensure the server has `.env` (and secrets) configured and `DATABASE_URL` pointing at your Postgres instance.

## License

Private / unlicensed unless stated otherwise.