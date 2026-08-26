import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { prisma } from "./prisma.js";

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { user_id: payload.userId },
                select: {
                    user_id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    role: true,
                },
            });

            if (!user) return done(null, false);

            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }),
);

export default passport;
