package helpers

import "math"

type GeoBoundingBox struct {
	S, W, N, E float64
}

const metersPerDegreeLatitude = 111320.0

func GetBoundingBox(lat, lon float64, sizeMeters int) GeoBoundingBox {
	size := float64(sizeMeters)
	dLat := size / (2 * metersPerDegreeLatitude)

	latRad := lat * math.Pi / 180
	cosLat := math.Cos(latRad)
	if cosLat < 0.01 {
		cosLat = 0.01
	}
	dLon := size / (2 * metersPerDegreeLatitude * cosLat)

	return GeoBoundingBox{
		S: lat - dLat,
		W: lon - dLon,
		N: lat + dLat,
		E: lon + dLon,
	}
}
