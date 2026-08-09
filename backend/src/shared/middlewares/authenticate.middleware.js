import passport from "passport";

const authenticate = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        console.log("ERR:", err);
        console.log("USER:", user);
        console.log("INFO:", info);

        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                info,
            });
        }

        req.user = user;
        next();
    })(req, res, next);
};

export default authenticate;
