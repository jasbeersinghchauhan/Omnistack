import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import query from "./db.js";

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        console.log("JWT Payload:", payload);
        
        try {
            const sql = `
                    SELECT user_id, first_name, last_name, email, role
                    FROM users
                    WHERE user_id = $1
                `;

            const rows = await query(sql, [payload.userId]);

            if (rows.length === 0)
                return done(null, false);

            return done(null, rows[0]);
        } catch (error) {
            return done(error, false);
        }
    })
);

export default passport;