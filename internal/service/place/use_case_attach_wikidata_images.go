package place

import (
	"context"

	"github.com/FelipeStillner/Orbita/internal/database"
	"github.com/google/uuid"
)

func (s *Service) attachWikidataImagesAfterUpsert(ctx context.Context, rows []database.UpsertPlacesFromOSMRow) error {
	if len(rows) == 0 {
		return nil
	}

	ids := make([]uuid.UUID, 0, len(rows))
	for _, r := range rows {
		ids = append(ids, r.ID)
	}

	existing, err := s.queries.ListPlaceImagesByPlaceIDs(ctx, ids)
	if err != nil {
		return err
	}
	hasImage := make(map[uuid.UUID]struct{}, len(existing))
	for _, e := range existing {
		hasImage[e.PlaceID] = struct{}{}
	}

	var pids []uuid.UUID
	var urls []string
	var descs []string
	var primary []bool

	for _, r := range rows {
		if !r.WikidataID.Valid || r.WikidataID.String == "" {
			continue
		}
		if _, ok := hasImage[r.ID]; ok {
			continue
		}
		wikiURLs, err := s.wikidata.FetchImageURLs(r.WikidataID.String)
		if err != nil || len(wikiURLs) == 0 {
			continue
		}
		for i, u := range wikiURLs {
			pids = append(pids, r.ID)
			urls = append(urls, u)
			descs = append(descs, "")
			primary = append(primary, i == 0)
		}
	}

	if len(pids) == 0 {
		return nil
	}

	return s.queries.AddPlaceImagesBatch(ctx, database.AddPlaceImagesBatchParams{
		PlaceIds:     pids,
		Urls:         urls,
		Descriptions: descs,
		IsPrimaries:  primary,
	})
}
