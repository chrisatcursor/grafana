---
description: Explains the pkg/services/auth Go package for Grafana backend contributors.
keywords:
  - grafana
  - authentication
  - developers
  - backend
  - go
labels:
  products:
    - enterprise
    - oss
menuTitle: Auth module (backend)
title: Auth module developer guide
weight: 250
canonical: https://grafana.com/docs/grafana/latest/developer-resources/auth-module/
---

# Auth module developer guide

This guide explains the **`pkg/services/auth`** Go package in the Grafana repository. You learn what the package owns, how it fits next to authentication and authorization elsewhere in the server, and how to use its main interfaces in code and tests.

Before you begin, ensure you have the following:

- **Familiarity with Go** and the layout of the Grafana backend under `pkg/services/`.
- **A local Grafana development setup** as described in the [developer guide](https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md).
- **Basic understanding of Grafana sign-in flows** at the product level; refer to [Configure Grafana](/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/) for end-user configuration.

{{< admonition type="note" >}}

The **`auth`** package is not the same as **`authn`** (authentication orchestration) or **`authz`** (authorization). This guide focuses on session tokens, identity tokens, JWT verification helpers, and related storage that live under `pkg/services/auth`.

{{< /admonition >}}

## How auth fits in the backend

- **`pkg/services/auth`**: Session and token plumbing—creating and validating **user session tokens**, optional **external identity provider (IdP) session** rows, **identity (ID) tokens** for forwarding to plugins and services, and **JWT** verification when JWT auth is enabled in configuration.
- **`pkg/services/authn`**: Authenticates incoming requests (clients, hooks, identity resolution). It uses `auth` where session tokens and ID tokens are required.
- **`pkg/services/authz`**: Answers authorization questions (for example, role-based access control and related checks).

When you add a feature that only needs "who is this user and is their session valid?", you often interact with **`auth.UserTokenService`** or **`auth.IDService`**. When you need "is this user allowed to do X?", you work with **`authz`** APIs instead.

## Package layout

The following table summarizes the main areas under `pkg/services/auth`:

| Location | Role |
| -------- | ---- |
| `auth.go` | Core types and **`UserTokenService`** interface. |
| `id.go` | **`IDService`** interface for signing and clearing **ID tokens**. |
| `external_session.go` | **`ExternalSession`** model and **`ExternalSessionStore`** for OAuth/OIDC-linked session rows. |
| `authimpl/` | Default implementation of **`UserTokenService`** (database-backed session tokens, rotation, revocation). |
| `idimpl/` | Default implementation of **`IDService`** (caching, signing, hooks into **authn**). |
| `jwt/` | **`JWTService`** for verifying JSON Web Tokens when JWT authentication is enabled. |
| `gcomsso/` | Grafana.com SSO logout hook (enterprise/cloud-related flows). |
| `authtest/` | Fakes and mocks for tests. |

## User session tokens (`UserTokenService`)

**`UserTokenService`** is the main interface for Grafana **user session tokens** (browser and similar sessions). It creates tokens, looks them up from the raw cookie value, rotates them, revokes them, and exposes active token counts for **quota** reporting.

The interface (simplified) includes operations such as:

- **`CreateToken`** — Issue a new session for a user (client IP and user agent are stored for auditing).
- **`LookupToken`** — Resolve an unhashed token string from the request to a **`UserToken`**.
- **`RotateToken`** — Rotate a valid token (sliding sessions).
- **`RevokeToken`** / **`RevokeAllUserTokens`** — Invalidate one or all sessions for a user.
- **`GetUserToken`** / **`GetUserTokens`** — Administrative inspection of tokens for a user.

Implementation lives in **`authimpl`** and is registered in Wire (for example, **`authimpl.ProvideUserAuthTokenService`** in `pkg/server/wireexts_oss.go`).

### Example: depend on `UserTokenService` in a service

```go
package example

import (
	"context"

	"github.com/grafana/grafana/pkg/services/auth"
	"github.com/grafana/grafana/pkg/services/user"
)

type Service struct {
	tokens auth.UserTokenService
}

func NewService(tokens auth.UserTokenService) *Service {
	return &Service{tokens: tokens}
}

func (s *Service) CreateSession(ctx context.Context, u *user.User, cmd *auth.CreateTokenCommand) (*auth.UserToken, error) {
	cmd.User = u
	return s.tokens.CreateToken(ctx, cmd)
}
```

**Placeholders:** `CreateTokenCommand` must include **`User`**, **`ClientIP`**, **`UserAgent`**, and optionally **`ExternalSession`** when the login is tied to an external IdP session.

## Identity tokens (`IDService`)

**`IDService`** signs **ID tokens** for a **`identity.Requester`** so Grafana can forward identity to **plugins** and external services in a standard JWT-shaped format. It also supports removing cached tokens when needed.

- **`SignIdentity`** — Returns a signed token string and parsed claims.
- **`RemoveIDToken`** — Clears stored or cached ID token state for the requester.

The reference implementation is in **`idimpl`**, which registers a post-authentication hook with **`authn`** to keep ID tokens in sync after login.

### Example: request an ID token for a signed-in identity

```go
package example

import (
	"context"

	"github.com/grafana/grafana/pkg/apimachinery/identity"
	"github.com/grafana/grafana/pkg/services/auth"
)

func IssuePluginToken(ctx context.Context, id auth.IDService, req identity.Requester) (string, error) {
	token, _, err := id.SignIdentity(ctx, req)
	if err != nil {
		return "", err
	}
	return token, nil
}
```

## JWT verification (`jwt` package)

When **[JWT authentication](/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/jwt/)** is enabled, Grafana uses **`jwt.AuthService`** (implementing **`jwt.JWTService`**) to **verify** incoming JSON Web Tokens against configured keys and claim expectations. The service is constructed with **`jwt.ProvideService`**; if JWT auth is disabled in configuration, initialization is a no-op.

For tests, **`jwt.NewFakeJWTService`** lets you stub **`Verify`** without standing up keys.

```go
package example

import (
	"context"

	"github.com/grafana/grafana/pkg/services/auth/jwt"
)

func ExampleVerify(js jwt.JWTService, raw string) (map[string]any, error) {
	return js.Verify(context.Background(), raw)
}
```

## External sessions

**`ExternalSession`** records link Grafana users to **OAuth2/OIDC**-style tokens and metadata (access token, refresh token, IdP session identifiers, expiry). **`UserTokenService`** methods such as **`GetExternalSession`** and **`UpdateExternalSession`** coordinate user session rows with this storage where the auth module is wired to external login.

If you work at the storage layer, **`ExternalSessionStore`** in **`external_session.go`** defines create, read, update, and delete operations for the **`user_external_session`** table.

## Testing

Use **`pkg/services/auth/authtest`** for **`FakeUserAuthTokenService`** and generated mocks (for example, **`MockUserAuthTokenService`**) when unit-testing components that depend on **`UserTokenService`**.

```go
package example_test

import (
	"testing"

	"github.com/grafana/grafana/pkg/services/auth/authtest"
)

func TestWithFakeTokens(t *testing.T) {
	tokens := authtest.NewFakeUserAuthTokenService()
	_ = tokens // pass to constructor under test
}
```

Run focused tests with:

```sh
go test ./pkg/services/auth/...
```

## Operational notes

- **Quota:** **`auth`** registers a quota reporter for active session tokens (`QuotaTargetSrv` / `QuotaTarget` in **`auth.go`**). Session limits in configuration interact with this path.
- **Errors:** The package defines typed errors such as **`ErrUserTokenNotFound`** and **`ErrInvalidSessionToken`**. Handle **`TokenExpiredError`** when you need user or token identifiers for logging or metrics.

## Next steps

- **HTTP API authentication** (Bearer tokens, basic auth) from a client perspective: [Authentication options for the HTTP API](./api-reference/http-api/authentication/).
- **End-user authentication configuration**: [Configure authentication](/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/).
- **Repository layout and contribution process**: [Contribute to Grafana](./contribute/) and the [architecture README](https://github.com/grafana/grafana/blob/main/contribute/architecture/README.md).
- **Source reference**: [`pkg/services/auth`](https://github.com/grafana/grafana/tree/main/pkg/services/auth) on GitHub.
