import * as passport from "passport";
import User, { IUser } from "../models/user";
import facebookStrategy from "./facebookStrategy";
import googleStrategy from "./googleStrategy";
import localStrategy from "./localStrategy";

(function initPassportStrategies() {
    passport.use(localStrategy);
    passport.use(facebookStrategy);
    passport.use(googleStrategy);

    passport.serializeUser(function(user: IUser, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

})();

export function mustBeLoggedIn(req: any, res: any, next: () => void) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    if (req.isAuthenticated()) { return next(); }
    res.redirect("/");
}

export function mustNotBeLoggedIn(req: any, res: any, next: () => void) {
    if (!req.isAuthenticated()) { return next(); }
    res.redirect("/");
}
