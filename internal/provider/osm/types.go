package osm

type Element struct {
	Type   string            `json:"type"`
	ID     int64             `json:"id"`
	Lat    float64           `json:"lat"`
	Lon    float64           `json:"lon"`
	Center *Center           `json:"center"`
	Tags   map[string]string `json:"tags"`
}

type Center struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

type OSMResponse struct {
	Elements []Element `json:"elements"`
}
