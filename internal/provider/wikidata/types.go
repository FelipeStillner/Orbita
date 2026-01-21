package wikidata

type data struct {
	Entities map[string]struct {
		Claims struct {
			P18 []struct {
				Mainsnak struct {
					Datavalue struct {
						Value string `json:"value"`
					} `json:"datavalue"`
				} `json:"mainsnak"`
			} `json:"P18"`
		} `json:"claims"`
	} `json:"entities"`
}
