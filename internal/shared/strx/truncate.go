// Truncation with ellipsis for logs and error messages.

package strx

import "strings"

// Truncate trims surrounding whitespace, then shortens s to at most max bytes
// before appending "..." when truncated (same semantics as len/slicing on string).
func Truncate(s string, max int) string {
	s = strings.TrimSpace(s)
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}
