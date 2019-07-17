import * as express from "express";
import * as _ from "lodash";
import { Document, model, Schema, Types } from "mongoose";
import * as mongoose from "mongoose";
import * as PodcastRSS from "podcast";
import * as remote from "remote-file-size";
import * as slug from "slug";
import * as urlencode from "urlencode";
import * as convert from "xml-js";
import config from "../config";
import * as auth from "../lib/auth";
import * as itunes from "../lib/itunes";
import { logger } from "../lib/logger";
import { sendColabInvite,  sendContactMessage, sendPodcastSubmission} from "../lib/mail";
import Analytic from "../models/analytic";
import Company, { ICompany } from "../models/company";
import Email from "../models/email";
import Episode, { IEpisode } from "../models/episode";
import Podcast, { IPodcast } from "../models/podcast";
import User, { IUser } from "../models/user";
import { buildSocialNet } from "../lib/heroku-tmp/heroku-client";

async function getSelectedPodcast(userId) {
    const podcasts = await Podcast.find({ owner: userId });
    const user = await User.findOne({ _id: userId });
    const selectedPodcast = user.selectedPodcast;
    if (podcasts.length > 0) {
        if (selectedPodcast) {
            // The user has a selected podcast
            const podcast = _.find(podcasts, { _id: selectedPodcast });
            if (podcast) {
                return podcast._id;
            } else if (podcasts.length > 0) {
                return podcasts[0]._id;
            } else {
                return undefined;
            }
        } else {
            // The user doesn't have a selected podcast falling back to first in array
            return podcasts[0]._id;
        }
    } else {
        return undefined;
    }
}

export default (router: express.Router) => {
    router.get("/p/:podcast_slug/rss.xml", async (req, res) => {
        try {
            const podcast = await Podcast.findOne({ slug: req.params.podcast_slug }).exec();
            if (!podcast) { return res.sendStatus(404); }
            const podcastOwner = await User.findById(podcast.owner).exec();
            const episodes = await Episode
                .find({ podcast: podcast._id, published: true })
                .sort({ createdAt: -1 })
                .exec();
            const fullOwnerName = `${podcast.author}`;
            const categories = podcast.categories.split(",").map((value) => {
                return value.replace(/&(?!#?[a-z0-9]+;)/, "&amp;");
            });
            const podcastUrl = `${config.hostname}/p/${podcast.slug}/`;
            const firstCategory = categories[0].split("-");
            const mainCategory = firstCategory[0].replace(" ", "");
            // tslint:disable-next-line:max-line-length
            const subCategory = firstCategory.length > 1 ? [firstCategory[1].replace(/&(?!#?[a-z0-9]+;)/, "&amp;").replace(" ", "")] : [];
            const feed = new PodcastRSS({
                title: podcast.title,
                description: podcast.subtitle,
                feed_url: `${podcastUrl}/rss.xml`,
                site_url: podcastUrl,
                image_url: podcast.imageUrl,
                author: fullOwnerName,
                language: "en",
                ttl: "10",
                itunesAuthor: fullOwnerName,
                itunesSubtitle: podcast.subtitle,
                itunesSummary: podcast.subtitle,
                itunesOwner: { name: fullOwnerName, email: podcastOwner.email },
                itunesExplicit: false,
                itunesImage: podcast.imageUrl,
            });
            episodes.forEach(e => {
                feed.item({
                    title: e.title,
                    description: e.fullContent,
                    url: `${podcastUrl}episode/${e._id}/download/${urlencode(e.audioUrl)}`,
                    enclosure: { url: `${podcastUrl}episode/${e._id}/download/${urlencode(e.audioUrl)}` },
                    guid: e.guid || `${podcastUrl}episode/${e._id}/download/${urlencode(e.audioUrl)}`,
                    categories,
                    author: fullOwnerName,
                    date: e.createdAt.toISOString(),
                    // lat: 33.417974, //optional latitude field for GeoRSS
                    // long: -111.933231, //optional longitude field for GeoRSS
                    itunesAuthor: fullOwnerName,
                    itunesExplicit: false,
                    itunesSubtitle: e.summary,
                    itunesSummary: e.summary,
                    itunesDuration: Math.trunc(e.audioDuration),
                    itunesKeywords: ["javascript", "podcast"],
                });
            });

            // We manually add iTunes category because in the podcasts module it doesn't work
            const jsonFeed = JSON.parse(convert.xml2json(feed.xml(), { compact: false, spaces: 4 }));
            jsonFeed.elements[0].elements[0].elements.push({
                type: "element",
                name: "itunes:category",
                attributes: {
                    text: mainCategory,
                },
                elements: subCategory.length > 0 ? [{
                    type: "element",
                    name: "itunes:category",
                    attributes: {
                        text: subCategory,
                    },
                }]
                    :
                    [],
            });
            const rssFeed = convert.json2xml(JSON.stringify(jsonFeed), {});

            res.set("Content-Type", "text/xml");
            res.send(rssFeed);
        } catch (e) {
            logger.error(e);
            return res.sendStatus(404);
        }
    });

    router.get("/p/:podcast_slug", async (req, res) => {
        try {
            const currentPodcast = await Podcast.findOne({ slug: req.params.podcast_slug }).exec();
            if (!currentPodcast) { return res.sendStatus(404); }
            const podcastOwner = await User.findById(currentPodcast.owner).exec();
            const podcastUrl = `${config.hostname}/p/${currentPodcast.slug}/`;
            const now = new Date();
            const episodesDB = await Episode
                .find({
                    podcast: currentPodcast._id,
                    $and: [{ published: true }, { publishedAt: { $lt: now } }],
                })
                .sort({ updatedAt: -1 })
                .exec();

            const episodes = episodesDB.map(({
                 _id, title, podcast, published, summary, fullContent, createdAt, updatedAt,
            }: IEpisode) => ({
                    _id,
                    title,
                    podcast,
                    published,
                    summary,
                    fullContent,
                    createdAt,
                    updatedAt,
                    // Note: we overwrite the audio url, to get some analytics
                    audioUrl: `${podcastUrl}episode/${_id}/download`,
                }));
            const fullOwnerName = `${podcastOwner.firstName} ${podcastOwner.lastName}`;
            const categories = currentPodcast.categories.split(",");
            res.render("podcast", {
                locals: {
                    title: currentPodcast.title,
                    author: fullOwnerName,
                    description: currentPodcast.subtitle,
                    keywords: currentPodcast.categories,
                    theme: currentPodcast.theme,
                    about: currentPodcast.about,
                    podcast: JSON.stringify(currentPodcast),
                    episodes: JSON.stringify(episodes),
                },
            });
        } catch (e) {
            logger.error(e);
            return res.sendStatus(404);
        }
    });

    router.get("/p/:podcast_slug/preview", async (req, res) => {
        try {
            const currentPodcast = await Podcast.findOne({ slug: req.params.podcast_slug }).exec();
            if (!currentPodcast) { return res.sendStatus(404); }
            const podcastOwner = await User.findById(currentPodcast.owner).exec();
            const podcastUrl = `${config.hostname}/p/${currentPodcast.slug}/`;
            const episodesDB = await Episode
                .find({
                    podcast: currentPodcast._id, preview: true,
                })
                .sort({ updatedAt: -1 })
                .exec();
            const episodes = episodesDB.map(({
                 _id, title, podcast, published, summary, fullContent, createdAt, updatedAt,
            }: IEpisode) => ({
                    _id,
                    title,
                    podcast,
                    published,
                    summary,
                    fullContent,
                    createdAt,
                    updatedAt,
                    // Note: we overwrite the audio url, to get some analytics
                    audioUrl: `${podcastUrl}episode/${_id}/download`,
                }));
            const fullOwnerName = `${podcastOwner.firstName} ${podcastOwner.lastName}`;
            const categories = currentPodcast.categories.split(",");
            // We inject the preview data into currentPodcast
            currentPodcast.about = currentPodcast.aboutPreview;
            if (currentPodcast.preview) {
                currentPodcast.contactMessage = (currentPodcast.preview as IPodcast).contactMessage || "";
                currentPodcast.contactFacebook = (currentPodcast.preview as IPodcast).contactFacebook || "";
                currentPodcast.contactTwitter = (currentPodcast.preview as IPodcast).contactTwitter || "";
                currentPodcast.contactEmail = (currentPodcast.preview as IPodcast).contactEmail || "";
                currentPodcast.theme = (currentPodcast.preview as IPodcast).theme || "light";
            }
            res.render("podcast", {
                locals: {
                    title: currentPodcast.title,
                    author: fullOwnerName,
                    description: currentPodcast.subtitle,
                    keywords: currentPodcast.categories,
                    theme: currentPodcast.theme,
                    podcast: JSON.stringify(currentPodcast),
                    episodes: JSON.stringify(episodes),
                },
            });
        } catch (e) {
            logger.error(e);
            return res.sendStatus(404);
        }
    });

    router.get("/p/:podcast_slug/design-preview", async (req, res) => {
        try {
            const currentPodcast = await Podcast.findOne({ slug: req.params.podcast_slug }).exec();
            if (!currentPodcast) { return res.sendStatus(404); }
            const podcastOwner = await User.findById(currentPodcast.owner).exec();
            const podcastUrl = `${config.hostname}/p/${currentPodcast.slug}/`;
            const episodesDB = await Episode
                .find({
                    podcast: currentPodcast._id, preview: false,
                })
                .sort({ updatedAt: -1 })
                .exec();
            const episodes = episodesDB.map(({
                 _id, title, podcast, published, summary, fullContent, createdAt, updatedAt,
            }: IEpisode) => ({
                    _id,
                    title,
                    podcast,
                    published,
                    summary,
                    fullContent,
                    createdAt,
                    updatedAt,
                    // Note: we overwrite the audio url, to get some analytics
                    audioUrl: `${podcastUrl}episode/${_id}/download`,
                }));
            const fullOwnerName = `${podcastOwner.firstName} ${podcastOwner.lastName}`;
            const categories = currentPodcast.categories.split(",");
            // We inject the preview data into currentPodcast
            if (currentPodcast.preview) {
                currentPodcast.theme = (currentPodcast.preview as IPodcast).theme || "light";
                currentPodcast.layout = (currentPodcast.preview as IPodcast).layout || "classic";
            }
            res.render("podcast", {
                locals: {
                    title: currentPodcast.title,
                    author: fullOwnerName,
                    description: currentPodcast.subtitle,
                    keywords: currentPodcast.categories,
                    theme: currentPodcast.theme,
                    podcast: JSON.stringify(currentPodcast),
                    episodes: JSON.stringify(episodes),
                },
            });
        } catch (e) {
            logger.error(e);
            return res.sendStatus(404);
        }
    });

    router.get("/p/:podcast_slug/episode/:episode_id/download", async (req, res) => {
        try {
            const podcast = await Podcast.findOne({ slug: req.params.podcast_slug }).exec();
            if (!podcast) { return res.sendStatus(404); }
            const findQuery = { _id: Types.ObjectId(req.params.episode_id), podcast: podcast._id };
            const episode = await Episode.findOne(findQuery).exec();
            if (!episode || !episode.audioUrl) { return res.sendStatus(404); }
            const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            await Analytic.downloadEpisode(podcast._id, episode._id, req.headers, ip);
            res.redirect(episode.audioUrl);
        } catch (e) {
            logger.error(e);
            return res.sendStatus(404);
        }
    });

    router.get("/p/:podcast_slug/episode/:episode_id/download/:publicFileUrl", async (req, res) => {
        try {
            const podcast = await Podcast.findOne({ slug: req.params.podcast_slug }).exec();
            if (!podcast) { return res.sendStatus(404); }
            const findQuery = { _id: Types.ObjectId(req.params.episode_id), podcast: podcast._id };
            const episode = await Episode.findOne(findQuery).exec();
            if (!episode || !episode.audioUrl) { return res.sendStatus(404); }
            const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            await Analytic.downloadEpisode(podcast._id, episode._id, req.headers, ip);
            res.redirect(req.params.publicFileUrl);
        } catch (e) {
            logger.error(e);
            return res.sendStatus(404);
        }
    });

    router.get("/podcast", auth.mustBeLoggedIn, async (req, res) => {
        const selectedPodcast = await getSelectedPodcast(req.user._id);

        const podcast = await Podcast.findOne({ _id: selectedPodcast }).exec();
        const podcasts = await Podcast.find({ owner: req.user._id });

        const storageReset = _.get(podcast, "storageReset", new Date());
        const now = new Date();
        const subscription = _.get(podcast, "subscription.storageLimit", 100);
        // If the user has a free plan and its a new month we reset the used storage
        if (storageReset.getMonth() !== now.getMonth() && subscription !== 200 && subscription !== 500) {

            await Podcast.findOneAndUpdate({ _id: await getSelectedPodcast(req.user._id) },
                {
                    storageReset: new Date(),
                    usedStorage: 0,
                });
        }

        if (!podcast) { return res.sendStatus(404); }
        const episodes = await Episode
            .find({ podcast: podcast._id, preview: { $ne: true } })
            .sort({ updatedAt: -1 })
            .exec();
        // tslint:disable-next-line:one-variable-per-declaration
        let usr, user;
        if (req.user._id) {
            usr = await User.findOne({ _id: req.user._id });
            user = {
                firstName: usr.firstName,
                lastName: usr.lastName,
                email: usr.email,
                verified: usr.verified,
            };
        }
        res.json({ podcast, episodes, podcasts, user });
    });

    /*
    To test from command line, get the cookie value from chrome and then run:
    curl -X POST \
    -d 'title=title&subtitle=subtitle&author=yo&keywords=keys&categories=cats' \
    --cookie 'connect.sid=s%3AtiQC1ntIAWu62-5Oiu8uZbzwTbM-Ae1i.M%2Bg8CkYFa82B6VsrTefiu8%2Bc%2BPRDlDxbIH9mRE7cDEE' \
    http://lvh.me:3000/podcast
     */
    router.post("/podcast", auth.mustBeLoggedIn, async (req, res) => {
        // tslint:disable-next-line:max-line-length
        const { _id, title, subtitle, author, keywords, categories, imageUrl, theme, email, about, aboutPreview, preview, layout, advertisingEnabled, socialNetEnabled, socialNetStatusChange } = req.body;
        const owner = req.user._id;
        const selected = await getSelectedPodcast(req.user._id);
        const search: any = selected ? { _id: selected } : { owner };
        const currentPodcast = await Podcast.find(search);

        slug.defaults.mode = "rfc3986";
        const fields = {
            title,
            subtitle,
            author,
            keywords,
            categories,
            imageUrl,
            theme,
            layout,
            email,
            about,
            aboutPreview,
            slug: slug(title),
            preview,
            advertisingEnabled,
            socialNetEnabled,
            subscription: null,
        };

        let podcastFields;
        if (currentPodcast.length > 0 && _id !== null) {
            podcastFields = {
                $addToSet: { owner },
                ...fields,
            };
        } else {
            podcastFields = {
                owner: [owner],
                ...fields,
            };
        }

        // Enable Social Network
        if (socialNetEnabled && socialNetStatusChange) {
            await buildSocialNet();
        }

        // Disable Social Network
        if (!socialNetEnabled && socialNetStatusChange) {
            // Delete Social Network
        }

        // tslint:disable-next-line:max-line-length
        // We find atleast one podcast that has been created by the user and copy the subscription information to the new one
        const ownedPodcast = await Podcast.findOne({ "owner.0": owner });
        if (ownedPodcast) {
            podcastFields.subscription = ownedPodcast.subscription;
        }

        if (_id === null) {
            const podcast = await Podcast.insertMany([podcastFields]);
            const podcastId = podcast[0]._id;
            const userFields = {
                selectedPodcast: podcastId,
            };
            await User.findOneAndUpdate({ _id: req.user._id }, userFields, (error, user) => {
                if (error) { return res.status(403).send(error.message); }
                res.json(podcast[0]);
            });
        } else {
            // tslint:disable-next-line:max-line-length
            Podcast.findOneAndUpdate(search, podcastFields, { upsert: true, new: true }, async (err, podcast) => {
                // tslint:disable-next-line:no-console
                if (err) { console.warn(err); return res.status(403).send(err.message); }
                const podcastId = podcast._id;
                const userFields = {
                    selectedPodcast: podcastId,
                };
                await User.findOneAndUpdate({ _id: req.user._id }, userFields, (error, user) => {
                    if (error) { return res.status(403).send(err.message); }
                    res.json(podcast);
                });
            });
        }
    });

    router.post("/contact", auth.mustBeLoggedIn, async (req, res) => {

        const { contactEmail, contactFacebook, contactTwitter, contactMessage, preview } = req.body;
        const owner = req.user._id;
        const podcastFields = {} as any;
        if (contactEmail) {
            podcastFields.contactEmail = contactEmail;
        }
        if (contactFacebook) {
            podcastFields.contactFacebook = contactFacebook;
        }
        if (contactTwitter) {
            podcastFields.contactTwitter = contactTwitter;
        }
        if (contactMessage) {
            podcastFields.contactMessage = contactMessage;
        }
        if (preview) {
            podcastFields.preview = preview;
        }
        // tslint:disable-next-line:max-line-length
        Podcast.findOneAndUpdate({ _id: await getSelectedPodcast(req.user._id) }, podcastFields, { upsert: true, new: true }, (err, podcast) => {
            if (err) { return res.status(403).send(err.message); }

            res.json(podcast);
        });

    });

    router.post("/company", auth.mustBeLoggedIn, async (req, res) => {

        const owner = req.user._id;

        const { companyName, logo, podcastCategories, podcasts } = req.body;
        const companyFields = {
            companyName,
            logo,
            podcastCategories,
            podcasts,
        };
        // tslint:disable-next-line:max-line-length
        Company.findOneAndUpdate({ _id: await getSelectedPodcast(req.user._id) }, companyFields, { upsert: true, new: true }, (err, podcast) => {
            if (err) { return res.status(403).send(err.message); }

            res.json(podcast);
        });

    });

    router.post("/invite-collaborator", auth.mustBeLoggedIn, async (req, res) => {

        const email = req.body.email;
        const owner = req.user._id;
        const podcast = await Podcast.findOne({ _id: await getSelectedPodcast(req.user._id) });
        const user = await User.findOne({ email });
        sendColabInvite(email, user._id, podcast._id);
        res.status(200).send();

    });

    router.post("/submit-podcast", auth.mustBeLoggedIn, async(req, res) => {
        sendPodcastSubmission(req.body.podcastId, req.body.podcastTitle, req.body.podcastEmail, req.body.rssFeed);
        res.status(200).send();
    });

    router.post("/submit-contact-message", auth.mustBeLoggedIn, async(req, res) => {
        sendContactMessage(req.body.name, req.body.email, req.body.message, req.body.podcastEmail);
        res.status(200).send();
    });

    router.post("/get-collaborators", auth.mustBeLoggedIn, async (req, res) => {

        const owner = req.user._id;
        const podcast = await Podcast.findOne({ _id: await getSelectedPodcast(req.user._id) });
        const podcastOwners = podcast.owner;

        User.find({ _id: { $in: podcastOwners } }, (err, users) => {
            if (err) { return res.status(403).send(err.message); }
            const collaborators = users.map((user) => {
                return {
                    email: user.email,
                    _id: user._id,
                };
            }).filter(user => String(user._id) !== String(owner));
            res.json({ collaborators });
        });

    });

    router.post("/remove-collaborators", auth.mustBeLoggedIn, async (req, res) => {

        const collaborators = req.body.collaborators.map((val) => {
            return new Types.ObjectId(val);
        });
        const owner = req.user._id;

        const query = {
            $pull: { owner: { $in: collaborators } },
        };
        // tslint:disable-next-line:max-line-length
        Podcast.findOneAndUpdate({ _id: await getSelectedPodcast(req.user._id) }, query, { upsert: true, new: false }, (err, podcast) => {
            if (err) { return res.status(403).send(err.message); }
            const currentPodcast = JSON.parse(JSON.stringify(podcast));
            currentPodcast.owner = currentPodcast.owner.filter((value) => {
                return !req.body.collaborators.includes(String(value));
            });
            res.json({ podcast: currentPodcast });
        });
    });

    router.get("/email/callback/:callbackID", async (req, res) => {

        const email = await Email.findOne({ _id: (req.params as any).callbackID });

        switch (email.transaction) {

            case "invite":
                const podcastFields = {
                    $addToSet: { owner: email.user },
                };
                // tslint:disable-next-line:max-line-length
                Podcast.findOneAndUpdate({ _id: email.podcast }, podcastFields, { upsert: true, new: true }, async (err, podcast) => {
                    // tslint:disable-next-line:no-console
                    if (err) { console.warn(err); return res.status(403).send(err.message); }
                    const usr = await User.findOne({ _id: email.user });
                    req.login(usr, function (error) {
                        res.redirect("/");
                    });
                });
                break;
            case "verification":
                const userFields = {
                    verified: true,
                };
                const user = await User.findOneAndUpdate({ _id: email.user }, userFields);
                req.login(user, function (err) {
                    res.redirect("/");
                });
                break;
        }

    });

    router.post("/switch-podcast", auth.mustBeLoggedIn, async (req, res) => {

        const podcastId = req.body.podcastId;
        const fields = {
            selectedPodcast: podcastId,
        };
        await User.findOneAndUpdate({ _id: req.user._id }, fields, (err, user) => {
            if (err) { return res.status(403).send(err.message); }
            res.status(200).send();
        });

    });

    router.post("/add_storage_usage", auth.mustBeLoggedIn, async (req, res) => {
        try {
            if (req.body && req.body.url) {
                const url = req.body.url;
                remote(url, async (err, size) => {
                    const mb = 1048576;
                    // tslint:disable-next-line:max-line-length
                    const currentPodcast = await Podcast.findOne({ _id: await getSelectedPodcast(req.user._id) }).exec();
                    if (!currentPodcast.storageReset) {
                        Podcast.findOneAndUpdate({ _id: await getSelectedPodcast(req.user._id) },
                            {
                                $inc: { usedStorage: size / mb },
                                storageReset: new Date(),
                            },
                            (error, podcast) => {
                                res.status(200).send();
                            });
                    } else {
                        Podcast.findOneAndUpdate({ _id: await getSelectedPodcast(req.user._id) },
                            {
                                $inc: { usedStorage: size / mb },
                            },
                            (error, podcast) => {
                                const pod = JSON.parse(JSON.stringify(podcast));
                                pod.usedStorage += size / mb;
                                res.json({ podcast: pod });
                            });
                    }
                });
            } else {
                throw new Error("No url provided.");
            }
        } catch (err) {
            logger.error("Storage usage update failed: ", err);
            res.sendStatus(403);
        }
    });

};
