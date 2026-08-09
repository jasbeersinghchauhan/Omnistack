# OmniStock API Endpoint Implementation Plan

**API Version:** v1  
**Base URL:** `/api/v1`  
**Technology:** Node.js, Express.js, PostgreSQL  
**Authentication:** JWT

---

## 1. Implementation Strategy

The API will be implemented incrementally in the following order:

1. Authentication
2. Authorization
3. Categories
4. Products
5. Sellers
6. Seller Products
7. Inventory
8. Seller Presence
9. Dashboard
10. Testing and Refinement

---

## 2. Phase 1 — Authentication

### Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/logout` | Protected |
| POST | `/api/v1/auth/forgot-password` | Public |
| POST | `/api/v1/auth/reset-password` | Reset Token |
| GET | `/api/v1/auth/profile` | Protected |

### Tasks

- [x] Register user
- [x] Hash passwords
- [x] Login user
- [x] Generate JWT
- [x] Validate authentication input
- [x] Add authentication rate limiting
- [ ] Implement profile endpoint
- [ ] Implement logout
- [ ] Implement forgot-password
- [ ] Implement password reset
- [ ] Test authentication endpoints

---

## 3. Phase 2 — Authorization

Apply role-based access control to protected endpoints.

### Roles

- `customer`
- `seller`
- `admin`

### Tasks

- [x] Create authorization middleware
- [ ] Define endpoint-level role requirements
- [ ] Apply authorization to protected routes
- [ ] Verify resource ownership
- [ ] Prevent unauthorized modifications
- [ ] Test role-based access control

---

## 4. Phase 3 — Categories

Categories are implemented before products because products reference `category_id`.

### Endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/categories` | Protected |
| GET | `/api/v1/categories/:id` | Protected |
| POST | `/api/v1/categories` | Authorized |
| PATCH | `/api/v1/categories/:id` | Authorized |
| DELETE | `/api/v1/categories/:id` | Authorized |

### Tasks

- [ ] Create category module
- [ ] Create routes and controller
- [ ] Create category service
- [ ] Add validation
- [ ] Implement CRUD endpoints
- [ ] Add authorization
- [ ] Add error handling
- [ ] Test category endpoints

---

## 5. Phase 4 — Products

Products represent the global product catalog.

### Endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/products` | Protected |
| GET | `/api/v1/products/:id` | Protected |
| GET | `/api/v1/products/search?q=` | Protected |
| GET | `/api/v1/products/category/:id` | Protected |
| POST | `/api/v1/products` | Authorized |
| PATCH | `/api/v1/products/:id` | Authorized |
| DELETE | `/api/v1/products/:id` | Authorized |

### Tasks

- [x] Create product routes
- [x] Create product controller
- [x] Create product service
- [x] Implement basic product CRUD
- [ ] Implement product retrieval by ID
- [ ] Implement product search
- [ ] Implement products by category
- [ ] Add validation
- [ ] Add pagination
- [ ] Add authorization
- [ ] Test product endpoints

---

## 6. Phase 5 — Sellers

The `seller` entity represents a store or business associated with a user.

### Endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/sellers` | Protected |
| GET | `/api/v1/sellers/:id` | Protected |
| POST | `/api/v1/sellers` | Authorized |
| PATCH | `/api/v1/sellers/:id` | Authorized |
| DELETE | `/api/v1/sellers/:id` | Authorized |

### Tasks

- [ ] Create seller module
- [ ] Create seller routes
- [ ] Create seller controller
- [ ] Create seller service
- [ ] Add seller validation
- [ ] Implement seller CRUD
- [ ] Add seller ownership checks
- [ ] Add authorization
- [ ] Test seller endpoints

---

## 7. Phase 6 — Seller Products

Seller-specific price and stock are stored in `seller_products`.

### Endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/sellers/:sellerId/products` | Protected |
| POST | `/api/v1/sellers/:sellerId/products` | Authorized |
| PATCH | `/api/v1/sellers/:sellerId/products/:productId` | Authorized |
| DELETE | `/api/v1/sellers/:sellerId/products/:productId` | Authorized |

### Tasks

- [ ] Create seller-product module
- [ ] Create routes, controller and service
- [ ] Add validation
- [ ] Implement seller product retrieval
- [ ] Add product to seller
- [ ] Update seller-specific price
- [ ] Update seller-specific stock
- [ ] Update inventory confidence score
- [ ] Remove seller product
- [ ] Verify seller ownership
- [ ] Add authorization
- [ ] Test seller-product endpoints

---

## 8. Phase 7 — Inventory

Inventory operations modify stock for seller-specific products.

### Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/inventory/stock-in` | Authorized |
| POST | `/api/v1/inventory/stock-out` | Authorized |
| GET | `/api/v1/inventory/history` | Protected |

### Tasks

- [ ] Finalize inventory history data model
- [ ] Create inventory module
- [ ] Create routes, controller and service
- [ ] Add validation
- [ ] Implement stock-in
- [ ] Implement stock-out
- [ ] Prevent negative stock
- [ ] Record inventory operations
- [ ] Implement inventory history
- [ ] Add pagination
- [ ] Use database transactions
- [ ] Add authorization
- [ ] Test inventory endpoints

> **Note:** An inventory history table is not currently defined in the database schema. It must be finalized before implementing the history endpoint.

---

## 9. Phase 8 — Seller Presence

The `presence` table stores the current availability status of a seller.

### Endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/sellers/:sellerId/presence` | Protected |
| PATCH | `/api/v1/sellers/:sellerId/presence` | Authorized |

### Tasks

- [ ] Create presence module
- [ ] Create routes, controller and service
- [ ] Implement presence retrieval
- [ ] Implement open/closed status update
- [ ] Update `last_seen`
- [ ] Verify seller ownership
- [ ] Add authorization
- [ ] Test presence endpoints

---

## 10. Phase 9 — Dashboard

The dashboard will provide aggregated information from the core API resources.

### Endpoint

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/dashboard/stats` | Protected |

### Tasks

- [ ] Create dashboard module
- [ ] Create routes, controller and service
- [ ] Implement product statistics
- [ ] Implement category statistics
- [ ] Implement seller statistics
- [ ] Implement stock statistics
- [ ] Add authorization
- [ ] Test dashboard endpoint

---

## 11. Phase 10 — Testing and Refinement

After implementing the endpoint groups, perform API-wide testing and refinement.

### Tasks

- [ ] Test successful requests
- [ ] Test validation errors
- [ ] Test authentication failures
- [ ] Test authorization failures
- [ ] Test not-found cases
- [ ] Test duplicate/conflict cases
- [ ] Test database constraint errors
- [ ] Test rate limiting
- [ ] Verify consistent response formats
- [ ] Verify error handling
- [ ] Review API security
- [ ] Commit completed implementations