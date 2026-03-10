package types

type Place struct {
	Name         string
	Description  string
	Category     string
	Lat          float64
	Long         float64
	WikidataID   string
	Tags         []string
	OpeningHours string
}
