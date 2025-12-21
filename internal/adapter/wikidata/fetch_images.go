package wikidata

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

func (c *Client) FetchImageURL(wikidataID string) (string, error) {
	url := fmt.Sprintf("https://www.wikidata.org/wiki/Special:EntityData/%s.json", wikidataID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("User-Agent", "OrbitaProject/1.0 (your_email@example.com)")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("wikidata API error: %d - check User-Agent or Rate Limits", resp.StatusCode)
	}

	var data data
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return "", err
	}

	claims := data.Entities[wikidataID].Claims.P18
	if len(claims) == 0 {
		return "", fmt.Errorf("no image found for %s", wikidataID)
	}
	fileName := claims[0].Mainsnak.Datavalue.Value

	fileName = strings.ReplaceAll(fileName, " ", "_")
	hash := md5.Sum([]byte(fileName))
	hashStr := fmt.Sprintf("%x", hash)
	part1 := hashStr[:1]
	part2 := hashStr[:2]

	finalURL := fmt.Sprintf("https://upload.wikimedia.org/wikipedia/commons/%s/%s/%s", part1, part2, fileName)

	return finalURL, nil
}
