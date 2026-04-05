package place

import "time"

// venueTimeLocation is the IANA zone used to interpret stored opening_hours for places.
// Change here if the product supports multiple regions.
func venueTimeLocation() *time.Location {
	loc, err := time.LoadLocation("Europe/Lisbon")
	if err != nil {
		return time.UTC
	}
	return loc
}
