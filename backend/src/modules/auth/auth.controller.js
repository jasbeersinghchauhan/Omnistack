import {
    registerUser,
    loginUser,
} from "./auth.service.js";

export const register = async (req, res, next) => {
    try {
        const user = await registerUser(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const data = await loginUser(req.body);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data,
        });
    } catch (err) {
        next(err);
    }
};