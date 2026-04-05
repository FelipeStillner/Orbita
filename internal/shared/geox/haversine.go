// Great-circle (Haversine) distance on the WGS-84 sphere.

package geox

import "math"

// EarthRadiusMeanMeters is the mean Earth radius in meters (WGS-84 sphere approximation).
const EarthRadiusMeanMeters = 6371000

// HaversineMeters returns the great-circle distance between two WGS-84 coordinates
// expressed in decimal degrees (latitude, longitude).
func HaversineMeters(lat1, lon1, lat2, lon2 float64) float64 {
	phi1 := lat1 * math.Pi / 180
	phi2 := lat2 * math.Pi / 180
	dphi := (lat2 - lat1) * math.Pi / 180
	dlambda := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(dphi/2)*math.Sin(dphi/2) + math.Cos(phi1)*math.Cos(phi2)*math.Sin(dlambda/2)*math.Sin(dlambda/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return EarthRadiusMeanMeters * c
}

// Point is a WGS-84 position in degrees.
type Point struct {
	Lat, Lon float64
}

// HaversinePointMeters is equivalent to HaversineMeters(a.Lat, a.Lon, b.Lat, b.Lon).
func HaversinePointMeters(a, b Point) float64 {
	return HaversineMeters(a.Lat, a.Lon, b.Lat, b.Lon)
}
