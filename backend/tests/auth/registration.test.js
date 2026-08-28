import request from "supertest";
import { jest } from "@jest/globals";
import { prisma } from "../../src/config/prisma.js";
import app from "../../src/app.js";

jest.setTimeout(15000);

const testUser = {
    firstName: "Test",
    lastName: "User",
    email: `test-${Date.now()}@example.com`,
    password: "SecurePassword123",
};

afterAll(async () => {
    await prisma.user.deleteMany({
        where: {
            email: testUser.email,
        },
    });
});

describe("POST /auth/register", () => {
    test("registers a user with valid data", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(testUser);

        expect(response.statusCode).toBe(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User registered successfully");

        expect(response.body.data).toMatchObject({
            first_name: "Test",
            last_name: "User",
            email: testUser.email.toLowerCase(),
            role: "customer",
        });

        expect(response.body.data).not.toHaveProperty("password");
        expect(response.body.data).not.toHaveProperty("password_hash");
    });

    test("rejects duplicate email", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(testUser);

        expect(response.statusCode).toBe(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Email already exists");
    });

    test("rejects invalid email", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                ...testUser,
                email: "invalid-email",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");
    });

    test("rejects a password shorter than eight characters", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                ...testUser,
                email: `short-${Date.now()}@example.com`,
                password: "Short1",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");
    });

    test("rejects a password without an uppercase letter", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                ...testUser,
                email: `uppercase-${Date.now()}@example.com`,
                password: "securepassword123",
            });

        expect(response.statusCode).toBe(400);
    });

    test("rejects missing first name", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                ...testUser,
                email: `missing-name-${Date.now()}@example.com`,
                firstName: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("does not allow the client to choose the role", async () => {
        const email = `role-${Date.now()}@example.com`;

        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                ...testUser,
                email,
                role: "admin",
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.data.role).toBe("customer");
    });

    test("stores the password as a hash", async () => {
        const email = `hash-${Date.now()}@example.com`;

        await request(app)
            .post("/api/v1/auth/register")
            .send({
                ...testUser,
                email,
            });

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        expect(user).not.toBeNull();
        expect(user.password_hash).not.toBe(testUser.password);
        expect(user.password_hash.length).toBeGreaterThan(50);
    });
});