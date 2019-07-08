import { OAuth2Strategy as Strategy } from "passport-google-oauth";
import config from "../config";
import User from "../models/user";

export default new Strategy({
    clientID: config.google.client.id,
    clientSecret: config.google.client.secret,
    callbackURL: config.google.callbackURL,
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        if (!profile || !profile.emails || !profile.emails.length) {
            return done(new Error("Invalid user profile email"));
        }
        const searchQuery = { email: profile.emails[0].value };
        const updates = {
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            googleToken: accessToken,
        };
        User.findOneAndUpdate(searchQuery, updates, { upsert: true, new: true }, (err, user) => {
            return err ? done(err) : done(null, user);
        });
    });
});
