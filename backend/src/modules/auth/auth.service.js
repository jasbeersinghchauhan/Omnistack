import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v7 as uuidv7 } from "uuid";
import query from "../../config/db.js";

export const registerUser = async (userData) => {
    const { firstName, lastName, email, password } = userData;

    const existingUser = await query("SELECT user_id FROM users     WHERE email = $1", [email]);

    if (existingUser.length > 0) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO users
        (
            user_id,
            first_name,
            last_name,
            email,
            password_hash
        )
        VALUES
        ($1,$2,$3,$4,$5)
        RETURNING
        user_id,
        first_name,
        last_name,
        email,
        role
    `;

    const values = [uuidv7(), firstName, lastName, email, hashedPassword];

    const rows = await query(sql, values);
    return rows[0];
};

export const loginUser = async ({ email, password }) => {
    const sql = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            password_hash,
            role
        FROM users
        WHERE email=$1
    `;

    const rows = await query(sql, [email]);
    if (rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new Error("Invalid email or password");
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
