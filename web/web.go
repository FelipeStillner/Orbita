package web

import (
	"embed"
	"io/fs"
)

//go:embed dist/*
var distFS embed.FS

// GetFileSystem returns the embedded filesystem stripped of the "dist" prefix
func GetFileSystem() (fs.FS, error) {
	return fs.Sub(distFS, "dist")
}
