package historian

import (
	"fmt"
	"strings"
)

// BackendType identifies different kinds of state history backends.
type BackendType string

// String implements Stringer for BackendType.
func (bt BackendType) String() string {
	return string(bt)
}

const (
	BackendTypeAnnotations BackendType = "annotations"
	BackendTypeLoki        BackendType = "loki"
	BackendTypeMultiple    BackendType = "multiple"
	BackendTypePrometheus  BackendType = "prometheus"
	BackendTypeNoop        BackendType = "noop"
)

func ParseBackendType(s string) (BackendType, error) {
	switch p := BackendType(strings.ToLower(strings.TrimSpace(s))); p {
	case BackendTypeAnnotations,
		BackendTypeLoki,
		BackendTypeMultiple,
		BackendTypePrometheus,
		BackendTypeNoop:
		return p, nil
	default:
		return "", fmt.Errorf("unrecognized state history backend: %s", p)
	}
}
