---
description: Guidelines for writing tests in the Grafana codebase. Apply when creating or modifying test files.
globs: "**/*_test.go,**/*.test.{ts,tsx}"
alwaysApply: false
---

# Writing Tests

## General Philosophy

- Every new feature or bug fix should include tests. If you're fixing a bug, write a test that reproduces it first.
- Test behavior, not implementation. Tests should survive refactors that don't change external behavior.
- Keep tests fast and isolated. No test should depend on another test's state or execution order.

## Go Tests

### Structure

Use table-driven tests for any function with multiple input/output scenarios:

```go
func TestCalculateScore(t *testing.T) {
	tests := []struct {
		name     string
		input    int
		expected int
	}{
		{name: "zero input", input: 0, expected: 0},
		{name: "positive input", input: 5, expected: 25},
		{name: "negative input", input: -3, expected: 9},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateScore(tt.input)
			require.Equal(t, tt.expected, result)
		})
	}
}
```

### Assertions

- Use `github.com/stretchr/testify/require` for assertions that should stop the test on failure.
- Use `github.com/stretchr/testify/assert` when the test can continue after a failure.
- Prefer `require.Equal`, `require.NoError`, `require.True` over manual `if` checks.

### Mocking

- Use interfaces for dependencies so they can be mocked in tests.
- Place mock implementations in a `*_test.go` file or a `mocks/` directory within the package.
- Use `mockery` for generating mocks from interfaces when the mock is complex.

### Running

```bash
go test -run TestSpecificTest ./pkg/services/myservice/    # Single test
go test -v ./pkg/services/myservice/...                     # All tests in package
make test-go-unit                                            # All unit tests
```

## Frontend Tests (TypeScript)

### Structure

Use descriptive `describe` and `it` blocks:

```tsx
describe('UserProfile', () => {
  it('should display the username', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
```

### Best Practices

- Query elements by **role** or **text** first. Fall back to `data-testid` only when no accessible query works.
- Use `userEvent` over `fireEvent` for simulating user interactions — it more closely mimics real browser behavior.
- Mock network requests with `msw` (Mock Service Worker) or by mocking `getBackendSrv()`.
- Always `await` async interactions and use `waitFor` for assertions on async state changes.

### Running

```bash
yarn test path/to/Component.test.tsx        # Single file
yarn test -t "should display username"      # By test name
yarn test --watch                            # Watch mode
yarn test -u                                 # Update snapshots
```

## What to Test

| Layer | What to cover |
|-------|--------------|
| API handlers | Request validation, status codes, response shape |
| Services | Core business logic, edge cases, error paths |
| Components | Rendering states (loading, error, success), user interactions |
| Utilities | Pure functions with various inputs, boundary conditions |

## What Not to Test

- Third-party library internals (trust that they work).
- Exact CSS class names or DOM structure — these are implementation details.
- Private functions directly — test them through the public API that uses them.
