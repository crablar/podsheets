import * as express from "express";
import * as passport from "passport";
import * as auth from "../lib/auth";

export default (router: express.Router) => {

    router.get("/logout", auth.mustBeLoggedIn, (req, res) => {
        req.logout();
        req.session.destroy(() => res.redirect("/"));
    });

    // LocalStrategy Auth
    router.post("/login",
        auth.mustNotBeLoggedIn,
        passport.authenticate("local", {
            successRedirect: "/",
        }),
    );

    // Facebook Auth
    router.get(
        "/auth/facebook",
        auth.mustNotBeLoggedIn,
        passport.authenticate("facebook", { scope: "email" }),
    );
    router.get(
        "/auth/facebook/callback",
        passport.authenticate("facebook", {
            successRedirect: "/#",
            failureRedirect: "/",
        }),
    );

    // Google Auth
    router.get(
        "/auth/google",
        auth.mustNotBeLoggedIn,
        passport.authenticate("google", { scope: ["profile", "email"] }),
    );
    router.get(
        "/auth/google/callback",
        passport.authenticate("google", {
            successRedirect: "/#",
            failureRedirect: "/",
        }),
    );
};
