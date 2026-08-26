import request from "supertest";
import { prisma } from "../../src/config/prisma.js";
import { jest }from "@jest/globals";
import app from "../../src/app.js";

jest.setTimeout(15000);

const user = {
    firstName: "Login",
    lastName: "Test",
    email: `login-${Date.now()}@example.com`,
    password: "SecurePassword123",
};

beforeAll(async () => {
    await request(app)
        .post("/api/v1/auth/register")
        .send(user);
});

afterAll(async () => {
    await prisma.user.delete({
        where: {
            email: user.email,
        },
    });

    await prisma.$disconnect();
});

describe("POST /auth/login", () => {
    test("logs in with valid credentials", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: user.email,
                password: user.password,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Login successful");

        expect(response.body.data.token).toBeDefined();

        expect(response.body.data.user).toMatchObject({
            email: user.email,
            first_name: "Login",
            last_name: "Test",
            role: "customer",
        });
    });

    test("rejects an incorrect password", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: user.email,
                password: "WrongPassword123",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("rejects a non-existent email", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "does-not-exist@example.com",
                password: "SecurePassword123",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("rejects invalid email format", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "not-an-email",
                password: "SecurePassword123",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");
    });

    test("rejects missing password", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: user.email,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("does not return password hash", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: user.email,
                password: user.password,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.data.user).not.toHaveProperty("password");
        expect(response.body.data.user).not.toHaveProperty("password_hash");
    });
});