package interfaces

import "io"

type Storage interface {
	Save(file io.Reader, filename string) (string, error)
}
