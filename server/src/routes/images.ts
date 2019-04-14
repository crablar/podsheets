import * as express from "express";
import * as _ from "lodash";
import * as slug from "slug";
import * as auth from "../lib/auth";
import { getSignedUrlForUpload } from "../lib/googleCloudStorage";
import { deleteFile } from "../lib/googleCloudStorage";
import { logger } from "../lib/logger";
import { sendVerification } from "../lib/mail";
import Images, { IImages } from "../models/images";
import Podcast, { IPodcast } from "../models/podcast";
import User, { IUser } from "../models/user";

export default (router: express.Router) => {
    router.post("/images/find/podcast", auth.mustBeLoggedIn, async (req, res) => {
        const podcast = req.body.podcast;
        const images = await Images.find({ podcast });
        res.json({ images });
    });
    router.post("/images/add", auth.mustBeLoggedIn, async (req, res) => {
        await Images.create({ ...req.body });
        const podcast = req.body.podcast;
        const images = await Images.find({ podcast });
        res.json({ images });
    });
    router.post("/images/delete/:imageId", auth.mustBeLoggedIn, async (req, res) => {
        const image = await Images.findOne({ _id: req.params.imageId });
        const podcast = await Podcast.findOne({ _id: image.podcast });
        const owners = podcast.owner.map((value) => {
            return value.toString();
        });
        if (_.includes(owners, req.user._id.toString())) {
            try {
                await deleteFile(image.url);
                await Images.remove({ _id: req.params.imageId });
                res.sendStatus(200);
            } catch (e) {
                res.sendStatus(500);
            }
        } else {
            res.sendStatus(403);
        }
    });
};
