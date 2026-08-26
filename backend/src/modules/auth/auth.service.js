import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v7 as uuidv7 } from "uuid";
import { prisma } from "../../config/prisma.js";

export const registerUser = async (userData) => {
    const { firstName, lastName, email, password } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await prisma.user.create({
            data: {
                user_id: uuidv7(),
                first_name: firstName,
                last_name: lastName,
                email: email.toLowerCase(),
                password_hash: hashedPassword,
            },
            select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
            }
        });

        return newUser;
    } catch (error) {
        if (error.code === "P2002") {
            const err = new Error("Email already exists");
            err.statusCode = 409;
            throw err;
        }
        throw error;
    }
};

export const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            password_hash: true,
            role: true
        }
    });

    if (!user) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }

    const token = jwt.sign(
        {
            userId: user.user_id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        },
    );

    return {
        token,
        user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        },
    };
};