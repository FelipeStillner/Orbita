package gcs

import (
	"context"
	"fmt"
	"io"
	"os"

	cloud_storage "cloud.google.com/go/storage"
)

func (c *storage) Save(file io.Reader, filename string) (string, error) {
	ctx := context.Background()

	client, err := cloud_storage.NewClient(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to create client: %v", err)
	}
	defer client.Close()

	bucketName := os.Getenv("GCS_BUCKET_NAME")
	if bucketName == "" {
		return "", fmt.Errorf("GCS_BUCKET_NAME is not set")
	}

	wc := client.Bucket(bucketName).Object(filename).NewWriter(ctx)

	if _, err = io.Copy(wc, file); err != nil {
		return "", fmt.Errorf("io.Copy: %v", err)
	}

	if err := wc.Close(); err != nil {
		return "", fmt.Errorf("Writer.Close: %v", err)
	}

	publicURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, filename)
	return publicURL, nil
}
