import { Strategy } from "passport-local";
import User from "../models/user";

export default new Strategy({
    usernameField: "email",
    passwordField: "password",
}, (email, password, done) => {
    process.nextTick(async () => {
        const user = await User.getByEmailAndPassword(email, password);
        if (!user) {
            return done(null, false, { message: "Invalid credentials." });
        }
        return done(null, user);
    });
});
