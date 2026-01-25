package osm

type element struct {
	Type   string            `json:"type"`
	ID     int64             `json:"id"`
	Lat    float64           `json:"lat"`
	Lon    float64           `json:"lon"`
	Center *center           `json:"center"`
	Tags   map[string]string `json:"tags"`
}

type center struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

type osmResponse struct {
	Elements []element `json:"elements"`
}
