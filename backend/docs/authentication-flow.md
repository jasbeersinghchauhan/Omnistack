## 1. Authentication Flow

1. User registers with their email, password, and required profile information.
2. Server validates the registration data.
3. Server securely hashes the password.
4. Server creates the user through Prisma.
5. User logs in using their email and password.
6. Server retrieves the user through Prisma.
7. Server verifies the supplied password against the stored password hash.
8. Server generates a signed JWT containing the user's ID and required authorization claims.
9. Client stores the token according to the application's security strategy.
10. Client sends the JWT with subsequent protected API requests.
11. Authentication middleware extracts and verifies the JWT.
12. Server identifies the authenticated user from the verified JWT claims.
13. Authorization middleware checks the user's role and permissions.
14. Server allows or rejects access to the requested resource.
15. Invalid, missing, or expired tokens result in an authentication error.

## 2. Prisma User Management

- Define a Prisma `User` model that matches the PostgreSQL database schema.
- Store the user's unique ID, email, password hash, role, and required profile information.
- Enforce unique constraints such as a unique email address.
- Use Prisma Client for user creation, retrieval, and updates.
- Never store plaintext passwords.
- Retrieve only the fields required for authentication and authorization.
- Keep Prisma database operations separate from JWT generation and verification logic.

## 3. Authentication Components

### User Model

Represents users stored in the PostgreSQL database through Prisma.

### Authentication Service

Responsible for:

- User registration
- Password hashing
- User login
- Password verification
- JWT generation

### JWT Utility

Responsible for:

- Signing JWTs
- Verifying JWTs
- Handling token expiration and invalid tokens

### Authentication Middleware

Responsible for:

- Extracting the JWT from requests
- Verifying the JWT
- Identifying the authenticated user
- Rejecting unauthenticated requests

### Authorization Middleware

Responsible for:

- Checking the authenticated user's role
- Enforcing role-based access control
- Rejecting unauthorized requests

### Prisma Client

Responsible for:

- Creating users
- Finding users during authentication
- Updating user information
- Interacting with the PostgreSQL database

## 4. Authentication and Authorization Errors

- Return `401 Unauthorized` when authentication is missing or invalid.
- Return `403 Forbidden` when authentication succeeds but authorization fails.
- Reject expired JWTs.
- Reject malformed or invalid JWTs.

## 5. Planned Authentication Flow

Client
  |
  | Register
  v
API
  |
  | Validate + Hash Password
  v
Prisma
  |
  | Create User
  v
PostgreSQL


Client
  |
  | Login
  v
API
  |
  | Find User
  v
Prisma
  |
  v
PostgreSQL
  |
  | User Data
  v
API
  |
  | Verify Password
  | Generate JWT
  v
Client
  |
  | JWT
  v
Protected API
  |
  | Verify JWT
  | Check Authorization
  v
Resource