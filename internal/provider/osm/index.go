package osm

import (
	"net/http"
	"time"
)

type placeProvider struct {
	httpClient *http.Client
}

func NewProvider() *placeProvider {
	return &placeProvider{
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}
