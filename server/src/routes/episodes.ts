import * as express from "express";
import * as _ from "lodash";
import { Types } from "mongoose";
import * as remote from "remote-file-size";
import * as auth from "../lib/auth";
import Episode from "../models/episode";
import Podcast, { IPodcast } from "../models/podcast";

import * as parsePodcast from "node-podcast-parser";
import * as request from "request";

import { deleteFile, saveToStorage } from "../lib/googleCloudStorage";

import User, { IUser } from "../models/user";

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

function addStorageUsage(url, userId, decrement = false) {
    return new Promise((resolve, reject) => {
        try {
            remote(url, async (err, size) => {
                const mb = 1048576;
                // tslint:disable-next-line:max-line-length
                const currentPodcast = await Podcast.findOne({ _id: await getSelectedPodcast(userId) }).exec();

                let incSize = decrement ? (-1 * (size / mb)) : (size / mb);

                const currentUse = _.get(currentPodcast, "usedStorage", 0);

                if (currentUse + incSize < 0) {
                    const diff = currentUse + incSize;
                    incSize = incSize - diff;
                }

                if (!currentPodcast.storageReset) {
                    Podcast.update({ "owner.0": userId }, {
                        $inc: { usedStorage: incSize },
                        storageReset: new Date(),
                    }, { multi: true },
                        async (error) => {
                            const podcast = Podcast.findOne({ _id: await getSelectedPodcast(userId) });
                            resolve(podcast);
                        });
                } else {
                    Podcast.update({ "owner.0": userId }, {
                        $inc: { usedStorage: incSize },
                    }, { multi: true },
                        async (error) => {
                            const podcast = Podcast.findOne({ _id: await getSelectedPodcast(userId) });
                            resolve(podcast);
                        });
                }
            });
        } catch (err) {
            reject();
        }
    });
}

export default (router: express.Router) => {

    router.get("/episode/:episode_id", auth.mustBeLoggedIn, async (req, res) => {
        const podcast = await Podcast.findOne({ _id: await getSelectedPodcast(req.user._id) }).exec();
        if (!podcast) { return res.sendStatus(404); }
        const findQuery = { _id: Types.ObjectId(req.params.episode_id), podcast: podcast._id };
        const episode = await Episode.findOne(findQuery).exec();
        if (!episode) { return res.sendStatus(404); }
        res.json(episode);
    });

    /*
    To test from command line, get the cookie value from chrome, the podcast id and then run:
    curl -X POST \
    -d 'title=title&audioURL=http://someaudio.com&summary=summary&fullContent=fullContent&published=true' \
    --cookie 'connect.sid=s%3Ag7iVTGsglECWle_6D8_COFX0HVoPVmgo.RdW4DiKe1At%2Fk1yyBTtoEed6%2F%2FdyU38i2ZfmUKNx5PY' \
    http://lvh.me:3000/podcast/episode
     */
    router.post("/episode", auth.mustBeLoggedIn, async (req, res) => {
        const owner = req.user._id;
        const podcast = await Podcast.findOne({ _id: await getSelectedPodcast(req.user._id) }).exec();
        if (!podcast) { return res.status(403).send("Please create a podcast first."); }
        const {
            _id,
            title,
            audioUrl,
            audioDuration,
            uploadUrl,
            summary,
            fullContent,
            published,
            publishedAt,
            preview,
            adPlacement,
        } = req.body;
        // tslint:disable-next-line:no-console
        const episodeFields: any = {
            podcast: podcast._id,
            title,
            audioUrl,
            uploadUrl,
            summary,
            fullContent,
            audioDuration,
            adPlacement,
        };
        if (published !== undefined) {
            episodeFields.published = published;
        }
        if (publishedAt !== undefined) {
            episodeFields.publishedAt = publishedAt;
        }
        if (preview !== undefined) {
            episodeFields.preview = preview;
        }

        const currentEpisode = await Episode.findOne({ _id });
        const currentAudioUrl = _.get(currentEpisode, "audioUrl", null);
        if (audioUrl !== currentAudioUrl) {

            if (currentAudioUrl) {
                await addStorageUsage(currentAudioUrl, req.user._id, true);
            }

            await addStorageUsage(audioUrl, req.user._id);

            if (currentAudioUrl) {
                try {
                    await deleteFile(currentAudioUrl);
                } catch (e) {
                    // tslint:disable-next-line:no-console
                    console.warn("error deleting file", e);
                }
            }
        }
        const updatedPodcast = await Podcast.findOne({ _id: await getSelectedPodcast(req.user._id) }).exec();

        // We remove any previews, before updating the episodes
        await Episode.remove({ preview: true });

        const findQuery = { _id: Types.ObjectId(_id) }; // if _id is provided, we use it to update an episode
        if (_id) {

            Episode.findOneAndUpdate(findQuery, episodeFields, { upsert: true, new: true }, (err, episode) => {
                if (err) { return res.status(403).send(err.message); }
                res.json({ episode, podcast: updatedPodcast });
            });
        } else {
            try {

                const episode = await Episode.create(episodeFields);
                if (!episode) { res.status(403).send("Episode creation failed."); }
                res.json({ episode, podcast: updatedPodcast });
            } catch (err) {

                res.status(403).send(err.message);
            }
        }
    });

    router.post("/reset-import", auth.mustBeLoggedIn, async (req, res) => {

        const owner = req.user._id;

        const fields = {
            importProgress: {},
        };

        // tslint:disable-next-line:max-line-length
        const podcast = await Podcast.findOneAndUpdate({ _id: await getSelectedPodcast(req.user._id) }, fields, { upsert: true, new: true });
        res.json({ podcast });

    });

    router.post("/import-rss", auth.mustBeLoggedIn, async (req, res) => {

        const owner = req.user._id;
        const feedUrl = req.body.url;
        const publish = req.body.publish;

        const selectedPodcast = await getSelectedPodcast(req.user._id);

        request(feedUrl, (err, resp, data) => {

            if (err) {
                res.status(403);
                return;
            }

            parsePodcast(data, async (pErr, p) => {
                const podcast = {
                    episodes: p.episodes.reverse(),
                    ...p,
                };
                if (err) {
                    res.status(403);
                    return;
                } else {
                    // tslint:disable-next-line:no-console
                    res.json({ podcast }).send();
                }

                let errorFound = false;

                try {
                    // tslint:disable-next-line:prefer-for-of
                    for (let i = 0; i < podcast.episodes.length; i++) {

                        // tslint:disable-next-line:no-shadowed-variable
                        const podcastFields = {
                            importProgress: {
                                current: i + 1,
                                total: podcast.episodes.length,
                                status: "Importing episodes",
                                done: false,
                            },
                        };

                        // tslint:disable-next-line:max-line-length
                        await Podcast.findOneAndUpdate({ _id: selectedPodcast }, podcastFields, { upsert: true, new: true });

                        const episode = podcast.episodes[i];
                        let publicFileUrl = null;
                        if (episode.enclosure && episode.enclosure.url) {
                            const file_url = episode.enclosure.url;
                            const file_name = file_url.split("/").pop().split("%2F").pop();
                            publicFileUrl = await saveToStorage(file_url, file_name);
                        }

                        const currentPodcast = await Podcast.findOne({ _id: selectedPodcast }).exec();

                        const episodeFields: any = {
                            podcast: currentPodcast._id,
                            title: episode.title,
                            audioUrl: publicFileUrl,
                            summary: episode.description,
                            fullContent: episode.description,
                            audioDuration: 0,
                            published: false,
                            publishedAt: new Date(),
                            guid: episode.guid,
                        };

                        if (publish && episode.title && episode.description) {
                            episodeFields.published = true;
                        }

                        try {
                            const currentEpisode = await Episode.create(episodeFields);
                        } catch (err) {
                            // tslint:disable-next-line:no-console
                            console.warn("ERROR", err);
                            errorFound = true;
                            const fields = {
                                importProgress: {
                                    current: podcast.episodes.length,
                                    total: podcast.episodes.length,
                                    status: "Feed import failed",
                                    error: true,
                                    done: true,
                                },
                            };
                            // tslint:disable-next-line:max-line-length
                            await Podcast.findOneAndUpdate({ _id: selectedPodcast }, fields, { upsert: true, new: true });
                        }

                    }
                } catch (err) {
                    errorFound = true;
                    const fields = {
                        importProgress: {
                            current: podcast.episodes.length,
                            total: podcast.episodes.length,
                            status: "Feed import failed",
                            error: true,
                            done: true,
                        },
                    };
                    // tslint:disable-next-line:max-line-length
                    await Podcast.findOneAndUpdate({ _id: selectedPodcast }, fields, { upsert: true, new: true });
                }
                if (!errorFound) {
                    const podcastFields = {
                        importProgress: {
                            current: podcast.episodes.length,
                            total: podcast.episodes.length,
                            status: "Feed imported successfully",
                            done: true,
                        },
                    };
                    // tslint:disable-next-line:max-line-length
                    await Podcast.findOneAndUpdate({ _id: selectedPodcast }, podcastFields, { upsert: true, new: true });
                }
            });
        });
    });

    router.delete("/episode/:episode_id", auth.mustBeLoggedIn, async (req, res) => {
        const podcast = await Podcast.findOne({ _id: await getSelectedPodcast(req.user._id) }).exec();
        if (!podcast) { return res.sendStatus(404); }
        const findQuery = { _id: Types.ObjectId(req.params.episode_id), podcast: podcast._id };
        const episode = await Episode.findOne(findQuery).exec();
        if (!episode) { return res.sendStatus(404); }
        if (episode.audioUrl) {
            try {
                await addStorageUsage(episode.audioUrl, req.user._id, true);
                await deleteFile(episode.audioUrl);
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.warn("Failed to delete file", e);
            }
        }
        await episode.remove();
        const updatedPodcast = await Podcast.findOne({ _id: await getSelectedPodcast(req.user._id) }).exec();
        res.json({ podcast: updatedPodcast });
    });

};
