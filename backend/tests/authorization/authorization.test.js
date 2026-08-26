import request from "supertest";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import { prisma } from "../../src/config/prisma.js";

jest.setTimeout(30000);

const users = {
    customer: {
        firstName: "Authorization",
        lastName: "Customer",
        email: `authorization-customer-${Date.now()}@example.com`,
        password: "SecurePassword123",
    },

    seller: {
        firstName: "Authorization",
        lastName: "Seller",
        email: `authorization-seller-${Date.now()}@example.com`,
        password: "SecurePassword123",
    },

    admin: {
        firstName: "Authorization",
        lastName: "Admin",
        email: `authorization-admin-${Date.now()}@example.com`,
        password: "SecurePassword123",
    },
};

const tokens = {};

beforeAll(async () => {
    for (const [role, user] of Object.entries(users)) {
        const registerResponse = await request(app)
            .post("/api/v1/auth/register")
            .send(user);

        expect(registerResponse.statusCode).toBe(201);

        const databaseUser = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
        });

        expect(databaseUser).not.toBeNull();

        await prisma.user.update({
            where: {
                user_id: databaseUser.user_id,
            },
            data: {
                role,
            },
        });

        const loginResponse = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: user.email,
                password: user.password,
            });

        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.body.data.token).toBeDefined();

        tokens[role] = loginResponse.body.data.token;
    }
});

afterAll(async () => {
    await prisma.user.deleteMany({
        where: {
            email: {
                in: Object.values(users).map((user) => user.email),
            },
        },
    });
});

describe("Authentication middleware", () => {
    test("rejects request without Authorization header", async () => {
        const response = await request(app)
            .get("/api/v1/products");

        expect(response.statusCode).toBe(401);
    });

    test("rejects malformed Bearer header", async () => {
        const response = await request(app)
            .get("/api/v1/products")
            .set("Authorization", "Bearer");

        expect(response.statusCode).toBe(401);
    });

    test("rejects invalid JWT", async () => {
        const response = await request(app)
            .get("/api/v1/products")
            .set("Authorization", "Bearer invalid.jwt.token");

        expect(response.statusCode).toBe(401);
    });

    test("rejects expired JWT", async () => {
        const response = await request(app)
            .get("/api/v1/products")
            .set(
                "Authorization",
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token",
            );

        expect(response.statusCode).toBe(401);
    });

    test("allows request with valid JWT", async () => {
        const response = await request(app)
            .get("/api/v1/products")
            .set("Authorization", `Bearer ${tokens.customer}`);

        expect(response.statusCode).not.toBe(401);
    });
});

describe("Role-based authorization", () => {
    describe("GET /api/v1/products", () => {
        test("allows customer with product:read permission", async () => {
            const response = await request(app)
                .get("/api/v1/products")
                .set("Authorization", `Bearer ${tokens.customer}`);

            expect(response.statusCode).toBe(200);
        });

        test("allows seller with product:read permission", async () => {
            const response = await request(app)
                .get("/api/v1/products")
                .set("Authorization", `Bearer ${tokens.seller}`);

            expect(response.statusCode).toBe(200);
        });

        test("allows admin with product:read permission", async () => {
            const response = await request(app)
                .get("/api/v1/products")
                .set("Authorization", `Bearer ${tokens.admin}`);

            expect(response.statusCode).toBe(200);
        });
    });

    describe("DELETE /api/v1/products/:id", () => {
        const productId = "01999999-9999-7999-8999-999999999999";

        test("rejects customer without product:delete permission", async () => {
            const response = await request(app)
                .delete(`/api/v1/products/${productId}`)
                .set("Authorization", `Bearer ${tokens.customer}`);

            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "You are not authorized to perform this action",
            );
        });

        test("rejects seller without product:delete permission", async () => {
            const response = await request(app)
                .delete(`/api/v1/products/${productId}`)
                .set("Authorization", `Bearer ${tokens.seller}`);

            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "You are not authorized to perform this action",
            );
        });

        test("allows admin with product:delete permission to reach controller", async () => {
            const response = await request(app)
                .delete(`/api/v1/products/${productId}`)
                .set("Authorization", `Bearer ${tokens.admin}`);

            expect(response.statusCode).toBe(404);
        });
    });
});