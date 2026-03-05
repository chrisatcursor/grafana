# Bugbot Security Rules

## No unbounded queries
All database queries must include a LIMIT clause or pagination.
Unbounded SELECT statements can be exploited for denial-of-service
by requesting resources that return millions of rows.

## HTTP clients must set timeouts
Never use the default HTTP client without explicit timeouts.
Missing timeouts on outbound requests allow a slow upstream
to hold connections indefinitely, exhausting server resources.

## Don't disable TLS verification
Do not set InsecureSkipVerify: true or NODE_TLS_REJECT_UNAUTHORIZED=0
in any code that reaches production. If a service needs a custom CA,
configure the certificate pool explicitly instead.

## New endpoints require auth middleware
Every new HTTP handler must be registered with an authentication
middleware. Unprotected endpoints should be explicitly annotated
with a justification comment and added to the public routes allowlist.

## Don't log request bodies or PII
Log statements must not include raw request bodies, email addresses,
tokens, or session identifiers. Use structured logging with a
sanitized request summary instead.

## Avoid wildcard CORS origins
Do not set Access-Control-Allow-Origin to "*" on authenticated
endpoints. CORS origins must be restricted to known frontend
domains defined in the service configuration.
