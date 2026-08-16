# JWT Authentication Documentation

## 1. JWT Implementation in Node.js

- Use JSON Web Tokens (JWT) for stateless authentication.
- Use a JWT library such as `jsonwebtoken` for token creation and verification.
- Store only required claims in the JWT payload, such as `user_id`.
- Store the JWT secret securely in environment variables.
- Set an appropriate token expiration time.
- Verify the JWT on every protected API request.
- Never store passwords or other sensitive information inside the JWT payload.
- Use HTTPS in production to protect tokens during transmission.

## 2. JWT Structure

A JWT consists of three parts:

1. Header
2. Payload
3. Signature

The payload should contain only the minimum information required by the API, such as:

- `user_id`
- Token expiration

Sensitive information such as passwords should never be included.

## 3. JWT Security Requirements

- Store the JWT secret in environment variables.
- Use a strong, unpredictable JWT secret.
- Set an expiration time for JWTs.
- Keep JWT payloads minimal.
- Reject expired tokens.
- Reject invalid or malformed tokens.
- Use HTTPS in production.
- Do not expose authentication secrets in source control or logs.

## 4. JWT Limitations and Trade-offs

- JWT access tokens are stateless and normally remain valid until expiration.
- Revoking an already-issued JWT requires an additional server-side strategy if immediate invalidation is required.
- Short-lived access tokens can reduce the impact of token theft.
- Including authorization data such as a role in the JWT improves request efficiency but means role changes may not affect already-issued tokens.
- JWT should not be treated as encrypted storage; its payload can be decoded by the client.