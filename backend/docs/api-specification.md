# OmniStock API Specification

**Project:** OmniStock
**API Version:** v1
**Base URL:** `/api/v1`
**Status:** Design Specification
**Technology:** Node.js, Express.js, PostgreSQL
**Authentication:** JWT (JSON Web Token)

---

## 1. Overview

The OmniStock API provides backend services for managing products, categories, suppliers, inventory operations, users, and dashboard statistics.

The API follows REST-style conventions and uses JSON for request and response payloads.

The API is versioned using the `/api/v1` prefix to allow future versions to be introduced without breaking existing clients.

### Base Route

```text
/api/v1
```

### Resource Groups

```text
/api/v1/auth
/api/v1/products
/api/v1/categories
/api/v1/suppliers
/api/v1/inventory
/api/v1/dashboard
```

---

# 2. General API Conventions

## 2.1 Content Type

Requests containing a body should use:

```http
Content-Type: application/json
```

Successful responses should return:

```http
Content-Type: application/json
```

---

## 2.2 Authentication Header

Protected endpoints use JWT authentication.

The token is sent using the `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Endpoints that do not require authentication are explicitly marked as **Public**.

---

## 2.3 Standard Success Response

Successful responses should follow a consistent structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

For collections:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": []
}
```

---

## 2.4 Standard Error Response

Errors should follow a consistent structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

For validation errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

Internal implementation details, database errors, stack traces, and sensitive information should not be exposed to API clients.

---

# 3. HTTP Status Codes

The API should use standard HTTP status codes.

| Status | Meaning               | Typical Use                                           |
| ------ | --------------------- | ----------------------------------------------------- |
| `200`  | OK                    | Successful GET, PATCH, login                          |
| `201`  | Created               | Successful POST creating a resource                   |
| `204`  | No Content            | Successful deletion when no response body is required |
| `400`  | Bad Request           | Invalid request or malformed input                    |
| `401`  | Unauthorized          | Missing or invalid authentication                     |
| `403`  | Forbidden             | Authenticated user lacks permission                   |
| `404`  | Not Found             | Requested resource does not exist                     |
| `409`  | Conflict              | Duplicate/conflicting resource                        |
| `422`  | Unprocessable Entity  | Valid request format but invalid data                 |
| `429`  | Too Many Requests     | Rate limit exceeded                                   |
| `500`  | Internal Server Error | Unexpected server-side error                          |

---

# 4. Authentication API

## Base Route

```text
/api/v1/auth
```

Authentication endpoints are responsible for user registration, login, logout, password recovery, password reset, and retrieving the authenticated user's profile.

---

## 4.1 User Registration

### Endpoint

```http
POST /api/v1/auth/register
```

**Authentication:** Public

### Purpose

Creates a new user account.

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

### Required Fields

* `name`
* `email`
* `password`

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

Passwords must never be returned in API responses.

### Possible Errors

* `400` — Invalid request
* `409` — Email already registered
* `422` — Validation failed
* `500` — Internal server error

---

# 4.2 User Login

### Endpoint

```http
POST /api/v1/auth/login
```

**Authentication:** Public

### Purpose

Authenticates a user and provides a JWT.

### Request Body

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Possible Errors

* `400` — Missing or invalid input
* `401` — Invalid credentials
* `429` — Too many login attempts
* `500` — Internal server error

---

# 4.3 User Logout

### Endpoint

```http
POST /api/v1/auth/logout
```

**Authentication:** Required

### Purpose

Logs out the authenticated user.

### Request Body

No request body is required.

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Implementation Note

The exact JWT logout strategy must be decided during implementation. Since JWTs are stateless, simply deleting a token on the client does not invalidate an already-issued token on the server. A token revocation strategy or short-lived access-token design may therefore be required.

---

# 4.4 Forgot Password

### Endpoint

```http
POST /api/v1/auth/forgot-password
```

**Authentication:** Public

### Purpose

Initiates the password recovery process.

### Request Body

```json
{
  "email": "john@example.com"
}
```

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "If the account exists, password reset instructions have been sent"
}
```

The response should not reveal whether a particular email address is registered.

---

# 4.5 Reset Password

### Endpoint

```http
POST /api/v1/auth/reset-password
```

**Authentication:** Public, using a password-reset token

### Purpose

Changes the user's password using a valid password-reset token.

### Request Body

```json
{
  "token": "<RESET_TOKEN>",
  "password": "NewSecurePassword123"
}
```

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### Possible Errors

* `400` — Invalid request
* `401` — Invalid or expired reset token
* `422` — Invalid password
* `500` — Internal server error

---

# 4.6 User Profile

### Endpoint

```http
GET /api/v1/auth/profile
```

**Authentication:** Required

### Purpose

Returns the profile of the currently authenticated user.

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

# 5. Product API

## Base Route

```text
/api/v1/products
```

The Product API manages product records and provides product retrieval, search, creation, modification, and deletion.

---

## 5.1 Get All Products

### Endpoint

```http
GET /api/v1/products
```

**Authentication:** Required

### Purpose

Retrieves a list of products.

### Query Parameters

```text
?page=1&limit=20
```

Optional filtering can be added during implementation.

### Example

```http
GET /api/v1/products?page=1&limit=20
```

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "category_id": 2,
      "supplier_id": 3,
      "price": 55000,
      "quantity": 20
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

# 5.2 Get Product by ID

### Endpoint

```http
GET /api/v1/products/:id
```

**Authentication:** Required

### Example

```http
GET /api/v1/products/1
```

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Laptop",
    "category_id": 2,
    "supplier_id": 3,
    "price": 55000,
    "quantity": 20
  }
}
```

### Errors

* `400` — Invalid product ID
* `404` — Product not found

---

# 5.3 Search Products

### Endpoint

```http
GET /api/v1/products/search?q=
```

**Authentication:** Required

### Example

```http
GET /api/v1/products/search?q=laptop
```

### Purpose

Searches products using a search query.

### Success Response

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": []
}
```

---

# 5.4 Get Products by Category

### Endpoint

```http
GET /api/v1/products/category/:id
```

**Authentication:** Required

### Example

```http
GET /api/v1/products/category/2
```

### Purpose

Retrieves products belonging to a specific category.

---

# 5.5 Add Product

### Endpoint

```http
POST /api/v1/products
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Request Body

```json
{
  "name": "Laptop",
  "category_id": 2,
  "supplier_id": 3,
  "price": 55000
}
```

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Laptop",
    "category_id": 2,
    "supplier_id": 3,
    "price": 55000
  }
}
```

---

# 5.6 Update Product

### Endpoint

```http
PATCH /api/v1/products/:id
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Example Request

```http
PATCH /api/v1/products/1
```

```json
{
  "name": "Gaming Laptop",
  "price": 60000
}
```

Only fields that need to be changed should be supplied.

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Gaming Laptop",
    "price": 60000
  }
}
```

---

# 5.7 Delete Product

### Endpoint

```http
DELETE /api/v1/products/:id
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Success Response

**Status:** `204 No Content`

No response body is required.

---

# 6. Category API

## Base Route

```text
/api/v1/categories
```

---

# 6.1 Get All Categories

```http
GET /api/v1/categories
```

**Authentication:** Required

### Success Response

```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": []
}
```

---

# 6.2 Get Category by ID

```http
GET /api/v1/categories/:id
```

**Authentication:** Required

### Success Response

```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Electronics"
  }
}
```

---

# 6.3 Create Category

```http
POST /api/v1/categories
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Request Body

```json
{
  "name": "Electronics"
}
```

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "name": "Electronics"
  }
}
```

---

# 6.4 Update Category

```http
PATCH /api/v1/categories/:id
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Request Body

```json
{
  "name": "Electronic Devices"
}
```

---

# 6.5 Delete Category

```http
DELETE /api/v1/categories/:id
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Success Response

**Status:** `204 No Content`

---

# 7. Supplier API

## Base Route

```text
/api/v1/suppliers
```

---

# 7.1 Get Suppliers

```http
GET /api/v1/suppliers
```

**Authentication:** Required

### Success Response

```json
{
  "success": true,
  "message": "Suppliers retrieved successfully",
  "data": []
}
```

---

# 7.2 Get Supplier Details

```http
GET /api/v1/suppliers/:id
```

**Authentication:** Required

### Success Response

```json
{
  "success": true,
  "message": "Supplier retrieved successfully",
  "data": {
    "id": 1,
    "name": "ABC Suppliers",
    "email": "supplier@example.com",
    "phone": "9876543210"
  }
}
```

---

# 7.3 Create Supplier

```http
POST /api/v1/suppliers
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Request Body

```json
{
  "name": "ABC Suppliers",
  "email": "supplier@example.com",
  "phone": "9876543210"
}
```

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "id": 1,
    "name": "ABC Suppliers",
    "email": "supplier@example.com",
    "phone": "9876543210"
  }
}
```

---

# 7.4 Update Supplier

```http
PATCH /api/v1/suppliers/:id
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Example Request

```json
{
  "phone": "9999999999"
}
```

---

# 7.5 Delete Supplier

```http
DELETE /api/v1/suppliers/:id
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Success Response

**Status:** `204 No Content`

---

# 8. Inventory API

## Base Route

```text
/api/v1/inventory
```

Inventory operations represent changes to product stock.

Inventory quantity should not be modified directly through the Product update endpoint. Stock changes should be represented through inventory operations so that they can be tracked in inventory history.

---

# 8.1 Increase Stock

### Endpoint

```http
POST /api/v1/inventory/stock-in
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Request Body

```json
{
  "product_id": 1,
  "quantity": 10
}
```

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "Stock increased successfully",
  "data": {
    "product_id": 1,
    "quantity_added": 10
  }
}
```

The operation should also create an inventory history record.

---

# 8.2 Decrease Stock

### Endpoint

```http
POST /api/v1/inventory/stock-out
```

**Authentication:** Required
**Authorization:** Based on user role/permissions

### Request Body

```json
{
  "product_id": 1,
  "quantity": 5
}
```

### Success Response

```json
{
  "success": true,
  "message": "Stock decreased successfully",
  "data": {
    "product_id": 1,
    "quantity_removed": 5
  }
}
```

### Validation

The API must prevent stock from becoming negative.

If the requested quantity is greater than the available quantity:

```json
{
  "success": false,
  "message": "Insufficient stock"
}
```

---

# 8.3 Inventory History

### Endpoint

```http
GET /api/v1/inventory/history
```

**Authentication:** Required

### Purpose

Retrieves historical stock-in and stock-out transactions.

### Example Response

```json
{
  "success": true,
  "message": "Inventory history retrieved successfully",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "type": "STOCK_IN",
      "quantity": 10,
      "user_id": 2,
      "created_at": "2026-08-09T10:30:00Z"
    }
  ]
}
```

Pagination should be supported when the inventory history becomes large.

---

# 9. Dashboard API

## Base Route

```text
/api/v1/dashboard
```

---

# 9.1 Inventory Statistics

### Endpoint

```http
GET /api/v1/dashboard/stats
```

**Authentication:** Required

### Purpose

Returns inventory-related statistics for the dashboard.

### Example Response

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "total_products": 100,
    "total_categories": 10,
    "total_suppliers": 25,
    "total_stock": 1500
  }
}
```

The exact statistics returned should be finalized according to the database schema and dashboard requirements.

---

# 10. Complete Endpoint Summary

| Resource   | Method   | Endpoint                        | Authentication |
| ---------- | -------- | ------------------------------- | -------------- |
| Auth       | `POST`   | `/api/v1/auth/register`         | Public         |
| Auth       | `POST`   | `/api/v1/auth/login`            | Public         |
| Auth       | `POST`   | `/api/v1/auth/logout`           | Required       |
| Auth       | `POST`   | `/api/v1/auth/forgot-password`  | Public         |
| Auth       | `POST`   | `/api/v1/auth/reset-password`   | Reset Token    |
| Auth       | `GET`    | `/api/v1/auth/profile`          | Required       |
| Products   | `GET`    | `/api/v1/products`              | Required       |
| Products   | `GET`    | `/api/v1/products/:id`          | Required       |
| Products   | `GET`    | `/api/v1/products/search?q=`    | Required       |
| Products   | `GET`    | `/api/v1/products/category/:id` | Required       |
| Products   | `POST`   | `/api/v1/products`              | Required       |
| Products   | `PATCH`  | `/api/v1/products/:id`          | Required       |
| Products   | `DELETE` | `/api/v1/products/:id`          | Required       |
| Categories | `GET`    | `/api/v1/categories`            | Required       |
| Categories | `GET`    | `/api/v1/categories/:id`        | Required       |
| Categories | `POST`   | `/api/v1/categories`            | Required       |
| Categories | `PATCH`  | `/api/v1/categories/:id`        | Required       |
| Categories | `DELETE` | `/api/v1/categories/:id`        | Required       |
| Suppliers  | `GET`    | `/api/v1/suppliers`             | Required       |
| Suppliers  | `GET`    | `/api/v1/suppliers/:id`         | Required       |
| Suppliers  | `POST`   | `/api/v1/suppliers`             | Required       |
| Suppliers  | `PATCH`  | `/api/v1/suppliers/:id`         | Required       |
| Suppliers  | `DELETE` | `/api/v1/suppliers/:id`         | Required       |
| Inventory  | `POST`   | `/api/v1/inventory/stock-in`    | Required       |
| Inventory  | `POST`   | `/api/v1/inventory/stock-out`   | Required       |
| Inventory  | `GET`    | `/api/v1/inventory/history`     | Required       |
| Dashboard  | `GET`    | `/api/v1/dashboard/stats`       | Required       |

---

# 11. API Security Requirements

The following requirements should be considered part of the Production API design.

## 11.1 Authentication

* Use JWT-based authentication for protected API endpoints.
* Verify the JWT on every protected request.
* Reject missing, malformed, expired, or invalid tokens.
* Do not expose passwords in responses.
* Store passwords using a strong password hashing algorithm such as bcrypt.
* Password-reset tokens must be time-limited and single-use.

---

## 11.2 Authorization

Authentication alone is not sufficient.

The API should verify that the authenticated user has permission to perform the requested operation.

Authorization should be applied to:

* Product creation
* Product modification
* Product deletion
* Category creation/modification/deletion
* Supplier creation/modification/deletion
* Stock operations
* Other administrative operations

Role-based access control should be implemented if multiple user roles are defined by the project.

---

## 11.3 Object-Level Authorization

For endpoints containing resource IDs, the API must verify access to the requested resource.

Examples:

```text
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id

GET    /categories/:id
PATCH  /categories/:id
DELETE /categories/:id

GET    /suppliers/:id
PATCH  /suppliers/:id
DELETE /suppliers/:id
```

A valid JWT does not automatically grant permission to access every resource.

---

## 11.4 Input Validation

All client-supplied input must be validated before processing.

Validation should cover:

* Required fields
* Data types
* String length
* Numeric ranges
* Email format
* IDs
* Query parameters
* Pagination parameters
* Password requirements
* Stock quantities

Examples:

```text
quantity > 0
price >= 0
page >= 1
limit > 0
```

---

## 11.5 Rate Limiting

Rate limiting should be applied to prevent abuse and excessive resource consumption.

Higher-priority endpoints include:

```text
POST /auth/login
POST /auth/register
POST /auth/forgot-password
POST /auth/reset-password
```

The API should return:

```text
429 Too Many Requests
```

when a client exceeds the configured request limit.

---

## 11.6 HTTPS

Production API communication must use HTTPS.

Sensitive information such as:

* Passwords
* JWTs
* Password-reset tokens
* User information

must not be transmitted over unencrypted HTTP.

---

## 11.7 Secure Error Handling

The API must not expose:

* Database credentials
* SQL queries
* Stack traces
* Internal file paths
* JWT secrets
* Environment variables
* Internal implementation details

Production clients should receive controlled error messages.

Detailed technical information should remain in server-side logs.

---

## 11.8 Security Logging

The API should record security-relevant events such as:

* Successful login
* Failed login
* Invalid JWT
* Unauthorized requests
* Password-reset requests
* Resource deletion
* Inventory stock-in
* Inventory stock-out
* Unexpected server errors

Logs should not contain passwords, JWT secrets, or other sensitive credentials.

---

## 11.9 CORS

Cross-Origin Resource Sharing should be explicitly configured.

The production API should not allow arbitrary origins unless there is a specific requirement for doing so.

---

## 11.10 Request Size Limits

Request body size should be limited to prevent unnecessarily large requests from consuming server resources.

---

## 11.11 API Versioning

All production endpoints should use an explicit API version:

```text
/api/v1
```

Future breaking changes can then be introduced under a new version:

```text
/api/v2
```

---

# 12. API Features and Functional Requirements

## Authentication

* User registration
* User login
* JWT authentication
* User logout
* Forgot password
* Reset password
* User profile
* Password hashing
* Authentication middleware
* Authorization middleware

## Product Management

* Create product
* Retrieve all products
* Retrieve product by ID
* Search products
* Retrieve products by category
* Update product
* Delete product
* Product validation
* Pagination

## Category Management

* Create category
* Retrieve all categories
* Retrieve category by ID
* Update category
* Delete category
* Category validation

## Supplier Management

* Create supplier
* Retrieve all suppliers
* Retrieve supplier by ID
* Update supplier
* Delete supplier
* Supplier validation

## Inventory Management

* Increase stock
* Decrease stock
* Prevent negative stock
* Record inventory transactions
* Retrieve inventory history
* Associate inventory operations with authenticated users

## Dashboard

* Retrieve inventory statistics
* Display product statistics
* Display category statistics
* Display supplier statistics
* Display stock statistics

## API Infrastructure

* API versioning
* Request validation
* Centralized error handling
* Consistent response format
* HTTP status code handling
* Authentication middleware
* Authorization middleware
* Rate limiting
* CORS configuration
* Security logging
* Request size limits
* Pagination
* API documentation
* Automated API testing

---

# 13. API Error Categories

The API should provide predictable errors.

### Authentication Error

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

HTTP status:

```text
401
```

### Authorization Error

```json
{
  "success": false,
  "message": "Forbidden"
}
```

HTTP status:

```text
403
```

### Resource Not Found

```json
{
  "success": false,
  "message": "Product not found"
}
```

HTTP status:

```text
404
```

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "quantity",
      "message": "Quantity must be greater than zero"
    }
  ]
}
```

HTTP status:

```text
422
```

### Rate Limit Error

```json
{
  "success": false,
  "message": "Too many requests"
}
```

HTTP status:

```text
429
```

### Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

HTTP status:

```text
500
```

---

# 14. Data Retrieval Requirements

Collection endpoints should support pagination where the number of records can grow significantly.

Recommended format:

```text
?page=1&limit=20
```

The API should provide pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

The API should also validate pagination parameters and enforce a maximum `limit` to prevent excessively large responses.

---

# 15. Data Modification Requirements

Create operations should use:

```http
POST
```

Partial update operations should use:

```http
PATCH
```

Delete operations should use:

```http
DELETE
```

Inventory stock changes should use dedicated business-operation endpoints:

```http
POST /api/v1/inventory/stock-in
POST /api/v1/inventory/stock-out
```

The Product update endpoint should not be used to arbitrarily modify inventory quantities.

---

# 16. API Design Principles

The OmniStock API should follow these principles:

1. **Resource-oriented design** — endpoints represent resources such as products, categories, and suppliers.
2. **HTTP method semantics** — use HTTP methods according to their intended operation.
3. **Stateless requests** — each request should contain the information required to process it.
4. **Consistent responses** — use a common response and error structure.
5. **Input validation** — never trust client-supplied input.
6. **Least privilege** — users should receive only the permissions required for their role.
7. **Secure by default** — protected resources should require authentication and authorization.
8. **Separation of concerns** — routing, validation, authentication, business logic, and database access should remain separate.
9. **Versioning** — breaking API changes should be introduced through a new API version.
10. **Observability** — security and operational events should be logged without exposing sensitive information.

---

# 17. Implementation Status

The following table can be updated as development progresses.

| Feature              | Design  | Implementation | Testing |
| -------------------- | ------- | -------------- | ------- |
| User Registration    | Planned | Pending        | Pending |
| User Login           | Planned | Pending        | Pending |
| User Logout          | Planned | Pending        | Pending |
| Password Recovery    | Planned | Pending        | Pending |
| User Profile         | Planned | Pending        | Pending |
| Product CRUD         | Planned | Pending        | Pending |
| Product Search       | Planned | Pending        | Pending |
| Category CRUD        | Planned | Pending        | Pending |
| Supplier CRUD        | Planned | Pending        | Pending |
| Stock In             | Planned | Pending        | Pending |
| Stock Out            | Planned | Pending        | Pending |
| Inventory History    | Planned | Pending        | Pending |
| Dashboard Statistics | Planned | Pending        | Pending |
| Input Validation     | Planned | Pending        | Pending |
| Authorization        | Planned | Pending        | Pending |
| Rate Limiting        | Planned | Pending        | Pending |
| Error Handling       | Planned | Pending        | Pending |
| Security Logging     | Planned | Pending        | Pending |

---

# 18. Future Extensions

The following features are not part of the currently defined endpoint set and should only be added if required by the project:

* Advanced product filtering
* Product sorting
* Low-stock alerts
* Supplier-product relationship endpoints
* Inventory reports
* Export functionality
* Audit-log retrieval
* User management for administrators
* Role management
* Refresh-token endpoint
* Notification system

These should be introduced only after the core API requirements have been implemented and tested.

---

# 19. Final Endpoint Structure

```text
/api/v1
│
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /forgot-password
│   ├── POST   /reset-password
│   └── GET    /profile
│
├── /products
│   ├── GET    /
│   ├── GET    /:id
│   ├── GET    /search?q=
│   ├── GET    /category/:id
│   ├── POST   /
│   ├── PATCH  /:id
│   └── DELETE /:id
│
├── /categories
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PATCH  /:id
│   └── DELETE /:id
│
├── /suppliers
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PATCH  /:id
│   └── DELETE /:id
│
├── /inventory
│   ├── POST   /stock-in
│   ├── POST   /stock-out
│   └── GET    /history
│
└── /dashboard
    └── GET    /stats
```

**Total currently defined endpoints: 26**