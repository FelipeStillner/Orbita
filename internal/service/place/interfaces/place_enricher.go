package interfaces

type PlaceEnricher interface {
	FetchImageURLs(wikidataID string) ([]string, error)
}
