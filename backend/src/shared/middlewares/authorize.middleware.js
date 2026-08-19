import { hasPermission } from "../authorization/permissions.js";

const authorize = (...requiredpermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const isAuthorized = requiredpermissions.some((permission) => {
            hasPermission(req.user.role, permission);
        });

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action",
            });
        }
        next();
    };
};

export default authorize;
