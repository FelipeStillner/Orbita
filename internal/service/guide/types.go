package guide

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/sqlc-dev/pqtype"
)

type ListItem struct {
	ID         uuid.UUID
	Title      string
	StepCount  int32
	PlaceCount int32
}

type PlaceInStep struct {
	PlaceID         uuid.UUID
	Name            string
	Latitude        float64
	Longitude       float64
	OptionNote      string
	Position        int32
	PrimaryImageURL string
	ImageURLs       []string
	Tags            []string
	PhotoCount      int32
	LikeCount       int32
	IsOpenNow       *bool
}

type StepDetail struct {
	ID         uuid.UUID
	Position   int32
	StepTitle  string
	StepNote   string
	Places     []PlaceInStep
	StepIndex  int
}

type Detail struct {
	ID        uuid.UUID
	Title     string
	Blurb     string
	CoverURL  string
	Tags      []string
	CreatedAt time.Time
	UpdatedAt time.Time
	Steps     []StepDetail
}

func tagsFromRaw(raw json.RawMessage) []string {
	if len(raw) == 0 {
		return nil
	}
	var tags []string
	if err := json.Unmarshal(raw, &tags); err != nil {
		return nil
	}
	return tags
}

// stringSliceFromJSONText parses a JSON string array from sqlc (PostgreSQL text / unknown).
func stringSliceFromJSONText(v interface{}) []string {
	if v == nil {
		return []string{}
	}
	var s string
	switch x := v.(type) {
	case string:
		s = x
	case []byte:
		s = string(x)
	default:
		return []string{}
	}
	if s == "" {
		return []string{}
	}
	var out []string
	if err := json.Unmarshal([]byte(s), &out); err != nil {
		return []string{}
	}
	if out == nil {
		return []string{}
	}
	return out
}

func tagsFromPlaceTags(n pqtype.NullRawMessage) []string {
	if !n.Valid || len(n.RawMessage) == 0 {
		return []string{}
	}
	var tags []string
	if err := json.Unmarshal(n.RawMessage, &tags); err != nil {
		return []string{}
	}
	if tags == nil {
		return []string{}
	}
	return tags
}
