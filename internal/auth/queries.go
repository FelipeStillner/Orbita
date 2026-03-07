package auth

import (
	"errors"

	"github.com/FelipeStillner/Orbita/internal/database"
)

var queries *database.Queries

func SetQueries(q *database.Queries) {
	queries = q
}

func getQueries() (*database.Queries, error) {
	if queries == nil {
		return nil, errors.New("auth: database queries are not initialized")
	}
	return queries, nil
}
