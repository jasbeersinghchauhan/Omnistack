# OmniStock API Specification

**Project:** OmniStock  
**API Version:** v1  
**Base URL:** `/api/v1`  
**Status:** Design Specification  
**Technology:** Node.js, Express.js, PostgreSQL  
**Authentication:** JWT

---

## 1. Overview

The OmniStock API provides services for:

- User authentication
- Product management
- Category management
- Seller management
- Seller-specific pricing and stock
- Seller presence
- Dashboard statistics

The API follows REST conventions and uses JSON payloads.

---

## 2. Database Resources

The API is based on the following PostgreSQL tables:

| Table | Purpose |
|---|---|
| `users` | User accounts and roles |
| `seller` | Seller/store information and location |
| `category` | Product categories |
| `product` | Product catalog |
| `seller_products` | Seller-specific price and stock |
| `presence` | Seller availability |

### Relationships

```
users
  └── seller
       ├── seller_products ── product ── category
       └── presence
```

---

## 3. API Routes

```
/api/v1/auth
/api/v1/products
/api/v1/categories
/api/v1/sellers
/api/v1/seller-products
/api/v1/presence
/api/v1/dashboard
```

---

## 4. API Conventions

### 4.1 Authentication

Protected endpoints use JWT:

```http
Authorization: Bearer <JWT_TOKEN>
```

### 4.2 Request Content Type

```http
Content-Type: application/json
```

### 4.3 Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### 4.4 Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### 4.5 Validation Error

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

---

## 5. HTTP Status Codes

| Status | Meaning |
|---|---|
| `200` | Successful request |
| `201` | Resource created |
| `204` | Resource deleted |
| `400` | Bad request |
| `401` | Authentication required or invalid |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Duplicate or conflicting resource |
| `422` | Validation error |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

# 6. Authentication API

## Base Route

```text
/api/v1/auth
```

User roles:

```text
customer
seller
admin
```

---

## 6.1 Register User

```http
POST /api/v1/auth/register
```

**Authentication:** Public

### Request

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePassword123"
}
```

### Required Fields

- `first_name`
- `last_name`
- `email`
- `password`

### Response

**201 Created**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

`password_hash` must never be returned.
The public registration endpoint always creates users with the `customer` role. The `seller` and `admin` roles must not be assigned through public registration.

---

## 6.2 Login

```http
POST /api/v1/auth/login
```

**Authentication:** Public

### Request

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "user_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

---

## 6.3 Logout

```http
POST /api/v1/auth/logout
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 6.4 Forgot Password

```http
POST /api/v1/auth/forgot-password
```

**Authentication:** Public

### Request

```json
{
  "email": "john@example.com"
}
```

### Response

```json
{
  "success": true,
  "message": "If the account exists, password reset instructions have been sent"
}
```

The response must not reveal whether the email exists.

---

## 6.5 Reset Password

```http
POST /api/v1/auth/reset-password
```

**Authentication:** Public with reset token

### Request

```json
{
  "token": "<RESET_TOKEN>",
  "password": "NewSecurePassword123"
}
```

### Response

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 6.6 Get Profile

```http
GET /api/v1/auth/profile
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

---

# 7. Product API

## Base Route

```text
/api/v1/products
```

The `product` table stores the global product catalog.

Price and stock are stored in `seller_products`.

---

## 7.1 Get Products

```http
GET /api/v1/products?page=1&limit=20
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "product_id": "uuid",
      "category_id": "uuid",
      "product_name": "Gaming Laptop",
      "brand": "TechCorp",
      "description": "High performance gaming laptop",
      "image_link": "https://example.com/image.png"
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

## 7.2 Get Product

```http
GET /api/v1/products/:id
```

**Authentication:** Required

`:id` must be a UUID.

### Response

```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product_id": "uuid",
    "category_id": "uuid",
    "product_name": "Gaming Laptop",
    "brand": "TechCorp",
    "description": "High performance gaming laptop",
    "image_link": "https://example.com/image.png"
  }
}
```

---

## 7.3 Search Products

```http
GET /api/v1/products/search?q=laptop
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": []
}
```

---

## 7.4 Get Products by Category

```http
GET /api/v1/products/category/:id
```

**Authentication:** Required

`:id` must be a category UUID.

---

## 7.5 Create Product

```http
POST /api/v1/products
```

**Authentication:** Required
**Authorization:** Admin

### Request

```json
{
  "category_id": "uuid",
  "product_name": "Gaming Laptop",
  "brand": "TechCorp",
  "description": "High performance gaming laptop",
  "image_link": "https://example.com/image.png"
}
```

### Response

**201 Created**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product_id": "uuid",
    "category_id": "uuid",
    "product_name": "Gaming Laptop",
    "brand": "TechCorp",
    "description": "High performance gaming laptop",
    "image_link": "https://example.com/image.png"
  }
}
```

---

## 7.6 Update Product

```http
PATCH /api/v1/products/:id
```

**Authentication:** Required
**Authorization:** Admin

### Request

```json
{
  "product_name": "Gaming Laptop Pro",
  "brand": "TechCorp",
  "description": "Updated description",
  "image_link": "https://example.com/new-image.png"
}
```

Only fields from the `product` table should be updated.

---

## 7.7 Delete Product

```http
DELETE /api/v1/products/:id
```

**Authentication:** Required
**Authorization:** Admin

**Response:** `204 No Content`
Deleting a product also deletes its associated `seller_products` records because of the database foreign-key cascade.

---

# 8. Category API

## Base Route

```text
/api/v1/categories
```

---

## 8.1 Get Categories

```http
GET /api/v1/categories
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": []
}
```

---

## 8.2 Get Category

```http
GET /api/v1/categories/:id
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "category_id": "uuid",
    "category_name": "Electronics"
  }
}
```

---

## 8.3 Create Category

```http
POST /api/v1/categories
```

**Authentication:** Required
**Authorization:** Admin

### Request

```json
{
  "category_name": "Electronics"
}
```

### Response

**201 Created**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category_id": "uuid",
    "category_name": "Electronics"
  }
}
```

---

## 8.4 Update Category

```http
PATCH /api/v1/categories/:id
```

**Authentication:** Required
**Authorization:** Admin

### Request

```json
{
  "category_name": "Electronic Devices"
}
```

---

## 8.5 Delete Category

```http
DELETE /api/v1/categories/:id
```

**Authentication:** Required
**Authorization:** Admin

**Response:** `204 No Content`
Deleting a category also deletes its associated products and their `seller_products` records because of the database foreign-key cascades.

---

# 9. Seller API

## Base Route

```text
/api/v1/sellers
```

The `seller` table stores seller/store information.

Seller email and phone belong to the related `users` record.

---

## 9.1 Get Sellers

```http
GET /api/v1/sellers
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Sellers retrieved successfully",
  "data": []
}
```

---

## 9.2 Get Seller

```http
GET /api/v1/sellers/:id
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Seller retrieved successfully",
  "data": {
    "seller_id": "uuid",
    "user_id": "uuid",
    "store_name": "ABC Electronics",
    "digipin": "2C3MPFT789",
    "coordinates": "POINT(77.2090 28.6139)",
    "verified": false
  }
}
```

---

## 9.3 Create Seller

```http
POST /api/v1/sellers
```

**Authentication:** Required

### Request

```json
{
  "user_id": "uuid",
  "store_name": "ABC Electronics",
  "digipin": "2C3MPFT789",
  "coordinates": "POINT(77.2090 28.6139)"
}
```

### Response

**201 Created**

```json
{
  "success": true,
  "message": "Seller created successfully",
  "data": {
    "seller_id": "uuid",
    "user_id": "uuid",
    "store_name": "ABC Electronics",
    "digipin": "2C3MPFT789",
    "coordinates": "POINT(77.2090 28.6139)",
    "verified": false
  }
}
```

---

## 9.4 Update Seller

```http
PATCH /api/v1/sellers/:id
```

**Authentication:** Required
**Authorization:** Seller (own seller record) or Admin
A seller can only update its own seller record.

### Request

```json
{
  "store_name": "ABC Electronics Store",
  "digipin": "2C3MPFT789",
  "coordinates": "POINT(77.2090 28.6139)"
}
```

---

## 9.5 Delete Seller

```http
DELETE /api/v1/sellers/:id
```

**Authentication:** Required
**Authorization:** Admin

**Response:** `204 No Content`
Deleting a seller also deletes its associated `seller_products` and `presence` records because of the database foreign-key cascades.

---

# 10. Seller Product API

## Base Route

```text
/api/v1/seller-products
```

The `seller_products` table connects sellers with products and stores:

- `price`
- `stock_quantity`
- `inventory_confidence_score`
- `last_updated`

---

## 10.1 Get Seller Products

```http
GET /api/v1/seller-products
```

**Authentication:** Required
Sellers may only access their own seller-product records. Admins may access records for any seller.

### Response

```json
{
  "success": true,
  "message": "Seller products retrieved successfully",
  "data": []
}
```

---

## 10.2 Get Seller Product

```http
GET /api/v1/seller-products/:id
```

**Authentication:** Required
**Authorization:** Seller (own records) or Admin

### Response

```json
{
  "success": true,
  "message": "Seller product retrieved successfully",
  "data": {
    "id": "uuid",
    "seller_id": "uuid",
    "product_id": "uuid",
    "price": 55000,
    "stock_quantity": 20,
    "inventory_confidence_score": 95,
    "last_updated": "2026-08-11T10:00:00Z"
  }
}
```

---

## 10.3 Add Seller Product

```http
POST /api/v1/seller-products
```

**Authentication:** Required
**Authorization:** Seller (own records) or Admin

### Request

```json
{
  "seller_id": "uuid",
  "product_id": "uuid",
  "price": 55000,
  "stock_quantity": 20,
  "inventory_confidence_score": 95
}
```
For a seller, `seller_id` must belong to the authenticated user. A seller must not be able to create inventory for another seller.
Admins may manage inventory for any seller.

### Validation

```text
price >= 0
stock_quantity >= 0
inventory_confidence_score BETWEEN 0 AND 100
```

A seller cannot have the same product more than once.

---

## 10.4 Update Seller Product

```http
PATCH /api/v1/seller-products/:id
```

**Authentication:** Required
**Authorization:** Seller (own record) or Admin
The `seller_id` and `product_id` fields cannot be changed through this endpoint.

### Request

```json
{
  "price": 60000,
  "stock_quantity": 25,
  "inventory_confidence_score": 90
}
```

---

## 10.5 Delete Seller Product

```http
DELETE /api/v1/seller-products/:id
```

**Authentication:** Required
**Authorization:** Seller (own record) or Admin

**Response:** `204 No Content`

---

# 11. Presence API

## Base Route

```text
/api/v1/presence
```

The `presence` table stores seller availability.

---

## 11.1 Get Seller Presence

```http
GET /api/v1/presence/:seller_id
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Seller presence retrieved successfully",
  "data": {
    "presence_id": "uuid",
    "seller_id": "uuid",
    "is_open": true,
    "last_seen": "2026-08-11T10:00:00Z"
  }
}
```

---

## 11.2 Update Seller Presence

```http
PATCH /api/v1/presence/:seller_id
```

**Authentication:** Required
**Authorization:** Seller (own presence) or Admin
A seller can only update the presence record associated with its own seller account.

### Request

```json
{
  "is_open": true
}
```

### Response

```json
{
  "success": true,
  "message": "Seller presence updated successfully",
  "data": {
    "presence_id": "uuid",
    "seller_id": "uuid",
    "is_open": true,
    "last_seen": "2026-08-11T10:00:00Z"
  }
}
```

---

# 12. Dashboard API

## Base Route

```text
/api/v1/dashboard
```

---

## 12.1 Get Dashboard Statistics

```http
GET /api/v1/dashboard/stats
```

**Authentication:** Required

### Response

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "total_products": 100,
    "total_categories": 10,
    "total_sellers": 25,
    "total_stock": 1500
  }
}
```

Statistics are derived from:

- `product`
- `category`
- `seller`
- `seller_products`

---

# 13. Security Requirements

## Authentication

- Use JWT for protected endpoints.
- Verify JWTs on every protected request.
- Reject missing, invalid or expired tokens.
- Never expose `password_hash`.
- Hash passwords using a secure hashing algorithm.
- Use temporary, single-use password-reset tokens.

## Authorization

The API must verify both the authenticated user's role and resource ownership.

- `customer` users cannot perform seller or admin management operations.
- `seller` users can manage only their own seller profile, seller products, and presence.
- `admin` users can manage products, categories, sellers, and seller inventory.
- Sellers must not access or modify another seller's resources.
- Administrative operations must require the `admin` role.

## Input Validation

Validate:

- Required fields
- UUIDs
- Email
- String length
- Numeric ranges
- Pagination
- Passwords
- DIGIPIN
- Coordinates
- Price
- Stock quantity
- Inventory confidence score

## Rate Limiting

Apply rate limiting to authentication endpoints, especially:

```text
POST /auth/register
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
```

Return:

```text
429 Too Many Requests
```

## HTTPS

Production API communication must use HTTPS.

## Error Handling

Do not expose:

- Database credentials
- SQL queries
- Stack traces
- JWT secrets
- Environment variables
- Internal file paths

## CORS

Allow only trusted origins in production.

## Request Limits

Set request body size limits to prevent excessively large requests.

---

# 14. Data Retrieval

Collection endpoints should support pagination:

```text
?page=1&limit=20
```

Example:

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

A maximum `limit` should be enforced.

---

# 15. Data Modification Rules

| Operation | HTTP Method |
|---|---|
| Create | `POST` |
| Partial update | `PATCH` |
| Delete | `DELETE` |
| Retrieve | `GET` |

Product catalog fields are managed through `/products`.

Seller-specific price, stock quantity, and inventory confidence score are managed through `/seller-products`.

There is no separate inventory-history API because the current database schema does not contain an inventory history table.

---

# 16. API Error Categories

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Forbidden"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Product not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Product already exists for this seller"
}
```

### 422 Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be greater than or equal to zero"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 17. Database Validation Rules

```text
users
├── email must be lowercase and unique
├── phone must be unique when provided
└── role = customer | seller | admin

seller
├── user_id must be unique
├── store_name is required
├── digipin is required
├── coordinates are required
└── verified defaults to false

category
└── category_name must be unique

product
├── category_id is required
└── (product_name, brand) must be unique

seller_products
├── (seller_id, product_id) must be unique
├── price >= 0
├── stock_quantity >= 0
└── inventory_confidence_score = 0–100

presence
└── one presence record per seller
```

---

# 18. Complete Endpoint Summary

| Resource | Method | Endpoint | Authentication | Authorization
|---|---|---|---|---|
| Auth | POST | `/api/v1/auth/register` | Public | - |
| Auth | POST | `/api/v1/auth/login` | Public |  - |
| Auth | POST | `/api/v1/auth/logout` | Required | Authenticated User |
| Auth | POST | `/api/v1/auth/forgot-password` | Public | - |
| Auth | POST | `/api/v1/auth/reset-password` | Reset Token | Valid reset user |
| Auth | GET | `/api/v1/auth/profile` | Required | Authenticated user |
| Products | GET | `/api/v1/products` | Required | All authenticated users |
| Products | GET | `/api/v1/products/:id` | Required | All authenticated users |
| Products | GET | `/api/v1/products/search?q=` | Required | All authenticated users |
| Products | GET | `/api/v1/products/category/:id` | Required | All authenticated users |
| Products | POST | `/api/v1/products` | Required | Admin |
| Products | PATCH | `/api/v1/products/:id` | Required | Admin |
| Products | DELETE | `/api/v1/products/:id` | Required | Admin |
| Categories | GET | `/api/v1/categories` | Required | All authenticated users |
| Categories | GET | `/api/v1/categories/:id` | Required | All authenticated users |
| Categories | POST | `/api/v1/categories` | Required | Admin |
| Categories | PATCH | `/api/v1/categories/:id` | Required | Admin | 
| Categories | DELETE | `/api/v1/categories/:id` | Required | Admin |
| Sellers | GET | `/api/v1/sellers` | Required | All authenticated users |
| Sellers | GET | `/api/v1/sellers/:id` | Required | All authenticated users |
| Sellers | POST | `/api/v1/sellers` | Required | Admin |
| Sellers | PATCH | `/api/v1/sellers/:id` | Required | Own selller/Admin |
| Sellers | DELETE | `/api/v1/sellers/:id` | Required | Admin |
| Seller Products | GET | `/api/v1/seller-products` | Required | Authenticated; ownership app;ies |
| Seller Products | GET | `/api/v1/seller-products/:id` | Required | Own seller/Admin |
| Seller Products | POST | `/api/v1/seller-products` | Required | Own seller/Admin |
| Seller Products | PATCH | `/api/v1/seller-products/:id` | Required | Own seller/Admin |
| Seller Products | DELETE | `/api/v1/seller-products/:id` | Required |  Own seller/Admin |
| Presence | GET | `/api/v1/presence/:seller_id` | Required | Authenticated users |
| Presence | PATCH | `/api/v1/presence/:seller_id` | Required | Own seller/Admin |
| Dashboard | GET | `/api/v1/dashboard/stats` | Required | Authenticated users |

**Total: 31 endpoints**

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
├── /sellers
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PATCH  /:id
│   └── DELETE /:id
│
├── /seller-products
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PATCH  /:id
│   └── DELETE /:id
│
├── /presence
│   ├── GET    /:seller_id
│   └── PATCH  /:seller_id
│
└── /dashboard
    └── GET    /stats
```

---

# 20. Implementation Status

| Feature | Design | Implementation | Testing |
|---|---|---|---|
| User Registration | Planned | Pending | Pending |
| User Login | Planned | Pending | Pending |
| User Logout | Planned | Pending | Pending |
| Password Recovery | Planned | Pending | Pending |
| User Profile | Planned | Pending | Pending |
| Product CRUD | Planned | Pending | Pending |
| Product Search | Planned | Pending | Pending |
| Category CRUD | Planned | Pending | Pending |
| Seller CRUD | Planned | Pending | Pending |
| Seller Product CRUD | Planned | Pending | Pending |
| Seller Presence | Planned | Pending | Pending |
| Dashboard Statistics | Planned | Pending | Pending |
| Input Validation | Planned | Pending | Pending |
| Authorization | Planned | Pending | Pending |
| Rate Limiting | Planned | Pending | Pending |
| Error Handling | Planned | Pending | Pending |
| Security Logging | Planned | Pending | Pending |