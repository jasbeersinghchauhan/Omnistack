import request from "supertest";
import jwt from "jsonwebtoken";
import { prisma } from "../../src/config/prisma.js";
import { jest } from "@jest/globals";
import app from "../../src/app.js";

jest.setTimeout(15000);

const user = {
    firstName: "JWT",
    lastName: "Test",
    email: `jwt-${Date.now()}@example.com`,
    password: "SecurePassword123",
};

let token;

beforeAll(async () => {
    await request(app)
        .post("/api/v1/auth/register")
        .send(user);

    const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
            email: user.email,
            password: user.password,
        });

    token = response.body.data.token;
});

afterAll(async () => {
    await prisma.user.delete({
        where: {
            email: user.email,
        },
    });

    await prisma.$disconnect();
});

describe("JWT authentication", () => {
    test("login returns a valid JWT", () => {
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET,
        );

        expect(payload.userId).toBeDefined();
        expect(payload.email).toBe(user.email);
        expect(payload.role).toBe("customer");
    });

    test("JWT contains the authenticated user's identity", async () => {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET,
        );

        const databaseUser = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
        });

        expect(payload.userId).toBe(databaseUser.user_id);
        expect(payload.email).toBe(databaseUser.email);
        expect(payload.role).toBe(databaseUser.role);
    });

    test("JWT contains an expiration claim", () => {
        const payload = jwt.decode(token);

        expect(payload.exp).toBeDefined();
        expect(payload.iat).toBeDefined();
        expect(payload.exp).toBeGreaterThan(payload.iat);
    });
});