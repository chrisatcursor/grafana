package featuremgmt

import (
	"context"
	"sort"

	"github.com/open-feature/go-sdk/openfeature"

	"github.com/grafana/grafana/pkg/setting"
)

// OpenFeatureClient returns the default OpenFeature client for flag evaluation.
func OpenFeatureClient() openfeature.IClient {
	return openfeature.NewDefaultClient()
}

// IsBooleanEnabled evaluates a boolean feature flag via OpenFeature.
func IsBooleanEnabled(ctx context.Context, flag string, fallback bool) bool {
	return OpenFeatureClient().Boolean(ctx, flag, fallback, openfeature.TransactionContext(ctx))
}

// FeatureFlagState represents the evaluated state of a feature flag.
type FeatureFlagState struct {
	Name            string `json:"name"`
	Description     string `json:"description"`
	Stage           string `json:"stage"`
	Enabled         bool   `json:"enabled"`
	ValueType       string `json:"valueType"`
	Value           any    `json:"value,omitempty"`
	RequiresDevMode bool   `json:"requiresDevMode,omitempty"`
	FrontendOnly    bool   `json:"frontendOnly,omitempty"`
	RequiresRestart bool   `json:"requiresRestart,omitempty"`
}

// EvaluateAllFlags returns evaluated states for all registered flags via OpenFeature.
func EvaluateAllFlags(ctx context.Context, flags []FeatureFlag, isDevMode bool) []FeatureFlagState {
	client := OpenFeatureClient()
	evalCtx := openfeature.TransactionContext(ctx)

	result := make([]FeatureFlagState, 0, len(flags))
	for _, flag := range flags {
		state := evaluateFlag(ctx, client, evalCtx, flag, isDevMode)
		result = append(result, state)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})

	return result
}

// GetEnabledViaOpenFeature returns a map of enabled boolean flags evaluated via OpenFeature.
func GetEnabledViaOpenFeature(ctx context.Context, flags []FeatureFlag, isDevMode bool) map[string]bool {
	states := EvaluateAllFlags(ctx, flags, isDevMode)
	enabled := make(map[string]bool, len(states))
	for _, state := range states {
		if state.Enabled {
			enabled[state.Name] = true
		}
	}
	return enabled
}

func evaluateFlag(ctx context.Context, client openfeature.IClient, evalCtx openfeature.EvaluationContext, flag FeatureFlag, isDevMode bool) FeatureFlagState {
	state := FeatureFlagState{
		Name:            flag.Name,
		Description:     flag.Description,
		Stage:           flag.Stage.String(),
		RequiresDevMode: flag.RequiresDevMode,
		FrontendOnly:    flag.FrontendOnly,
		RequiresRestart: flag.RequiresRestart,
	}

	if flag.RequiresDevMode && !isDevMode {
		state.Enabled = false
		state.ValueType = "boolean"
		state.Value = false
		return state
	}

	expression := flag.Expression
	if expression == "" {
		expression = "false"
	}

	inMemFlag, err := setting.ParseFlag(flag.Name, expression)
	if err != nil {
		state.Enabled = false
		state.ValueType = "boolean"
		state.Value = false
		return state
	}

	typedFlag := TypedFlag(inMemFlag)
	switch typedFlag.GetFlagType() {
	case FlagTypeBoolean:
		defaultVal := flag.Expression == "true"
		value := client.Boolean(ctx, flag.Name, defaultVal, evalCtx)
		state.Enabled = value
		state.ValueType = "boolean"
		state.Value = value
	case FlagTypeInteger:
		value := client.Int(ctx, flag.Name, 0, evalCtx)
		state.Enabled = value != 0
		state.ValueType = "integer"
		state.Value = value
	case FlagTypeFloat:
		value := client.Float(ctx, flag.Name, 0, evalCtx)
		state.Enabled = value != 0
		state.ValueType = "float"
		state.Value = value
	case FlagTypeString:
		value := client.String(ctx, flag.Name, "", evalCtx)
		state.Enabled = value != ""
		state.ValueType = "string"
		state.Value = value
	case FlagTypeObject:
		value := client.Object(ctx, flag.Name, map[string]any{}, evalCtx)
		if objectValue, ok := value.(map[string]any); ok {
			state.Enabled = len(objectValue) > 0
		}
		state.ValueType = "object"
		state.Value = value
	default:
		state.Enabled = false
		state.ValueType = "boolean"
		state.Value = false
	}

	return state
}
