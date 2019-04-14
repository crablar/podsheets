import * as express from "express";
import * as slug from "slug";
import * as auth from "../lib/auth";
import { getSignedUrlForUpload } from "../lib/googleCloudStorage";
import { logger } from "../lib/logger";
import { sendVerification } from "../lib/mail";
import Podcast, { IPodcast } from "../models/podcast";
import User, { IUser } from "../models/user";

export default (router: express.Router) => {
    router.get("/whoami", async (req, res) => {
        const isAuthenticated = req.isAuthenticated();
        if (isAuthenticated) {
            const user = await User.findOne({ _id: req.user._id });
            res.json({
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    verified: user.verified,
                },
            });
        } else {
            res.sendStatus(401);
        }
    });

    router.post("/sign_up", auth.mustNotBeLoggedIn, async (req, res) => {
        const { firstName, lastName, email, password } = req.body;
        const verified = false;
        try {
            let user = await User.signUp(firstName, lastName, email, password);
            user = await User.findOneAndUpdate({ _id: user.id }, { verified: false });
            sendVerification(user.email, user._id);
            if (!user) { return res.status(403).send("User registration failed."); }
            req.login(user, err => res.sendStatus(200));
        } catch (err) {
            return res.status(403).send(err.message);
        }
    });

    router.get("/upload_policy", auth.mustBeLoggedIn, async (req, res) => {
        try {
            if (req.query && req.query.filename && req.query.type) {
                slug.defaults.mode = "rfc3986";
                const secureFilename = `${new Date().getTime()}/${slug(req.query.filename)}`;
                const uploadUrl = await getSignedUrlForUpload(secureFilename, req.query.type);
                const bucket = process.env.GOOGLE_STORAGE_BUCKET;
                const publicFileUrl = `http://storage.googleapis.com/${bucket}/${secureFilename}`;
                res.json({ uploadUrl, publicFileUrl });
            } else {
                throw new Error("No filename provided.");
            }
        } catch (err) {
            logger.error("UploadPolicy Error: ", err);
            res.sendStatus(403);
        }
    });

    router.get("/server-config", (req, res) => {
        res.json({
            env: {
                STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
                USER_ACCOUNTS_ENABLED: process.env.USER_ACCOUNTS_ENABLED,
                AUDIO_EDITOR: process.env.AUDIO_EDITOR,
                AD_PLACEMENT: process.env.AD_PLACEMENT,
                IMPORT_RSS_ENABLED: process.env.IMPORT_RSS_ENABLED,
                SUBSCRIPTION_ENABLED: process.env.SUBSCRIPTION_ENABLED,
            },
        });
    });

    router.get(/^.*(hot-update|worker\.js){1}.*$/, function (req, res) {
        res.redirect("/dist/" + req.originalUrl);
    });
};
