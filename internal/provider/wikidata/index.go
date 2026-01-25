package wikidata

import (
	"net/http"
	"time"
)

type placeEnricher struct {
	httpClient *http.Client
}

func NewProvider() *placeEnricher {
	return &placeEnricher{
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}
