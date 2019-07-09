import { Strategy } from "passport-facebook";
import config from "../config";
import User from "../models/user";

export default new Strategy({
    clientID: config.facebook.client.id,
    clientSecret: config.facebook.client.secret,
    callbackURL: config.facebook.callbackURL,
    profileFields: ["id", "displayName", "emails", "name"],
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        if (!profile || !profile.emails || !profile.emails.length) {
            return done(new Error("Invalid user profile email"));
        }
        const searchQuery = { email: profile.emails[0].value };
        const updates = {
            name: profile.displayName,
            email: profile.emails[0].value,
            facebookId: profile.id,
            facebookToken: accessToken,
        };

        User.findOneAndUpdate(searchQuery, updates, { upsert: true, new: true }, (err, user) => {
            return err ? done(err) : done(null, user);
        });
    });
});
