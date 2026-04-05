// OSM-style opening_hours parsing (subset): see IsOpenAt / IsOpenNow.

package timex

import (
	"regexp"
	"strconv"
	"strings"
	"time"
)

var segmentRe = regexp.MustCompile(`(?i)^\s*([a-z]{2}(?:-[a-z]{2})?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$`)

// IsOpenNow is shorthand for IsOpenAt(hours, loc, time.Now()).
func IsOpenNow(hours string, loc *time.Location) *bool {
	return IsOpenAt(hours, loc, time.Now())
}

// IsOpenAt returns whether the venue is open at now (in loc), or nil if the string
// could not be interpreted. If loc is nil, times are interpreted in UTC.
func IsOpenAt(hours string, loc *time.Location, now time.Time) *bool {
	if loc == nil {
		loc = time.UTC
	}
	oh := strings.TrimSpace(hours)
	if oh == "" {
		return nil
	}
	lower := strings.ToLower(oh)
	switch lower {
	case "24/7", "24/7;":
		t := true
		return &t
	case "closed":
		f := false
		return &f
	}

	now = now.In(loc)
	wd := int(now.Weekday())
	curH, curM := now.Hour(), now.Minute()

	segments := strings.Split(oh, ";")
	anyParsed := false
	for _, seg := range segments {
		seg = strings.TrimSpace(seg)
		if seg == "" {
			continue
		}
		if strings.HasPrefix(strings.ToLower(seg), "ph") {
			continue
		}
		open, parsed := evalSegment(seg, wd, curH, curM)
		if !parsed {
			continue
		}
		anyParsed = true
		if open {
			t := true
			return &t
		}
	}
	if !anyParsed {
		return nil
	}
	f := false
	return &f
}

func evalSegment(seg string, weekday, curH, curM int) (open bool, parsed bool) {
	m := segmentRe.FindStringSubmatch(strings.TrimSpace(seg))
	if m == nil {
		return false, false
	}
	days := expandDayRange(m[1])
	if len(days) == 0 {
		return false, false
	}
	today := false
	for _, d := range days {
		if d == weekday {
			today = true
			break
		}
	}
	if !today {
		return false, true
	}
	sh, sm, ok1 := parseClock(m[2])
	eh, em, ok2 := parseClock(m[3])
	if !ok1 || !ok2 {
		return false, false
	}
	return minutesInRange(curH, curM, sh, sm, eh, em), true
}

func parseClock(s string) (h, m int, ok bool) {
	parts := strings.Split(s, ":")
	if len(parts) != 2 {
		return 0, 0, false
	}
	hh, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, 0, false
	}
	mm, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, 0, false
	}
	if mm < 0 || mm > 59 {
		return 0, 0, false
	}
	if hh < 0 || hh > 24 {
		return 0, 0, false
	}
	if hh == 24 && mm != 0 {
		return 0, 0, false
	}
	return hh, mm, true
}

func dayCodeToWeekday(code string) int {
	switch strings.ToLower(code) {
	case "mo":
		return 1
	case "tu":
		return 2
	case "we":
		return 3
	case "th":
		return 4
	case "fr":
		return 5
	case "sa":
		return 6
	case "su":
		return 0
	default:
		return -1
	}
}

func expandDayRange(s string) []int {
	s = strings.TrimSpace(s)
	if i := strings.Index(s, "-"); i > 0 {
		a, b := s[:i], s[i+1:]
		start := dayCodeToWeekday(a)
		end := dayCodeToWeekday(b)
		if start < 0 || end < 0 {
			return nil
		}
		if start == end {
			return []int{start}
		}
		if start < end {
			var out []int
			for d := start; d <= end; d++ {
				out = append(out, d)
			}
			return out
		}
		if start == 6 && end == 0 {
			return []int{6, 0}
		}
		var out []int
		for d := start; d <= 6; d++ {
			out = append(out, d)
		}
		for d := 0; d <= end; d++ {
			out = append(out, d)
		}
		return out
	}
	d := dayCodeToWeekday(s)
	if d < 0 {
		return nil
	}
	return []int{d}
}

func minutesInRange(curH, curM, sh, sm, eh, em int) bool {
	cur := curH*60 + curM
	start := sh*60 + sm
	end := eh*60 + em
	if start <= end {
		return cur >= start && cur < end
	}
	return cur >= start || cur < end
}
