import axios from "axios";
import { autobind, throttle } from "core-decorators";
import * as _ from "lodash";
import { action, computed, observable } from "mobx";
import { IPodcastContactFields } from "../components/admin/forms/PodcastContactForm";
import { IPodcastDesignFields } from "../components/admin/forms/PodcastDesignForm";
import { IEpisode, IImages, IPodcast, IUploadProgress, IUser } from "../lib/interfaces";

function clone(obj: object) {
    return JSON.parse(JSON.stringify(obj));
}

export class RootState {
    @observable.ref public loadingCount: number = 0;
    @observable.ref public isAuthenticated: boolean = false;
    @observable.ref public podcast: IPodcast;
    @observable.ref public podcasts: IPodcast[];
    @observable.ref public episodes: IEpisode[] = [];
    @observable.ref public currentEpisode: IEpisode = null;
    @observable.ref public uploadProgress: IUploadProgress = {};
    @observable.ref public importProgress: object;
    @observable.ref public billingHistory: any[];
    @observable.ref public me: IUser;
    @observable.ref public env: any;
    @observable.ref public images: IImages[];
    @observable.ref public warningDismissed: boolean;

    @computed get publishedEpisodes() {
        return this.episodes.filter(e => {
            const publishedAt = (new Date(e.publishedAt)).getTime();
            const now = (new Date()).getTime();
            return (e.published && (publishedAt <= now));
        });
    }

    @computed get draftEpisodes() {
        return this.episodes.filter(e => !e.published);
    }

    @computed get scheduledEpisodes(): IEpisode[] {
        return this.episodes.filter(e => {
            const publishedAt = (new Date(e.publishedAt)).getTime();
            const now = (new Date()).getTime();
            return (e.published && (publishedAt > now));
        });
    }

    constructor() {
        this.checkIfAuthenticated();
        window.onbeforeunload = () => {
            let isDirty = false;
            if (this.uploadProgress) {
                _.forIn(this.uploadProgress, (value: IUploadProgress, key) => {
                    const progressEvent: any = value.progress;
                    if (progressEvent && progressEvent.loaded && progressEvent.total) {
                        // tslint:disable-next-line:one-line
                        if (Math.ceil((+progressEvent.loaded / progressEvent.total) * 100) !== 100) {
                            isDirty = true;
                        }
                    }
                });
            }
            return isDirty ? "You have unfinished uploads!" : undefined;
        };
    }

    @autobind
    @action
    public async checkIfAuthenticated() {
        this.loadingCount++;
        try {
            try {
                const config = await axios.get("/server-config");
                this.env = config.data.env;
            } catch (err) {
                console.warn(err);
            }
            const response = await axios.get("/whoami");
            if (response.data.user) {
                this.me = response.data.user;
            }
            this.isAuthenticated = true;
        } catch (e) {
            this.isAuthenticated = false;
        } finally {
            this.loadingCount--;
        }
    }

    @autobind
    @action
    public async signUpUser(firstName: string, lastName: string, email: string, password: string) {
        try {
            await axios.post("/sign_up", { firstName, lastName, email, password });
            await this.checkIfAuthenticated();
        } catch (e) {
            throw new Error((e.response && e.response.data) || "User registration failed");
        }
    }

    @autobind
    @action
    public async subscribe(token: any, storageLimit: number) {
        try {

            const response = await axios.post("/subscribe", {
                stripeToken: token.id, // JSON.stringify(token),
                stripeEmail: token.email,
                storageLimit,
            });
            this.podcast = response.data.podcast;

            const billingHistory = await axios.post("/billing-history", {});
            if (billingHistory.data) {
                this.billingHistory = _.get(billingHistory, "data.charges.data", []);
            }

            return { status: "ok" };
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Payment failed");
        }
    }

    @autobind
    @action
    public async cancelSubscription() {
        try {
            const response = await axios.post("/cancel-subscription");
            this.podcast = response.data.podcast;
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Subscription cancellation failed");
        }
    }

    @autobind
    @action
    public async signInUser(email: string, password: string) {
        try {
            await axios.post("/login", { email, password });
            await this.checkIfAuthenticated();
        } catch (e) {
            throw new Error("Authentication failed.");
        }
    }

    @autobind
    @action
    public async logout() {
        this.isAuthenticated = false;
        this.podcast = null;
        this.episodes = [];
        this.currentEpisode = null;
        await axios.get("/logout");
    }

    @autobind
    @action
    public async dismissWarning() {
        this.warningDismissed = true;
    }

    @autobind
    @action
    public async getPodcastWithEpisodes() {
        if (this.isAuthenticated && this.podcast) {
            return;
        }
        this.loadingCount++;
        try {
            // Core data
            const response: any = await axios.get("/podcast");
            this.podcast = response.data.podcast;
            this.episodes = response.data.episodes;
            this.podcasts = response.data.podcasts;
            this.me = response.data.user;
            // Billing information
            const billingHistory: any = await axios.post("/billing-history");
            this.billingHistory = _.get(billingHistory, "data.charges.data", []);
            // Uploaded image information
            const images = await axios.post("/images/find/podcast", { podcast: this.podcast._id });
            this.images = images.data.images;

            this.loadingCount--;
        } catch (e) {
            this.loadingCount--;
        }
    }

    @autobind
    @action
    public async getEpisodeById(params: { episodeId: string }) {
        const { episodeId } = params;
        if (this.isAuthenticated && this.podcast && this.episodes.length) {
            const currentEpisode = this.episodes.find(e => e._id === episodeId);
            if (currentEpisode) {
                this.currentEpisode = currentEpisode;
                return;
            }
        }
        this.loadingCount++;
        try {
            await this.getPodcastWithEpisodes();
            const response: any = await axios.get(`/episode/${episodeId}`);
            this.currentEpisode = response.data;
            this.loadingCount--;
        } catch (e) {
            this.loadingCount--;
            throw new Error("Episode not found.");
        }
    }

    @autobind
    @action
    public async unsetCurrentEpisode() {
        this.currentEpisode = null;
    }

    @autobind
    @action
    public async deleteEpisode(episode: IEpisode) {
        const { _id } = episode;
        if (_id && this.isAuthenticated && this.podcast && this.episodes.length) {
            this.loadingCount++;
            try {
                await this.getPodcastWithEpisodes();
                const response = await axios.delete(`/episode/${_id}`);
                if (response.data.podcast) {
                    this.podcast = response.data.podcast;
                }
                let episodeIndex = -1;
                let episodeFound = false;
                this.episodes.find((e, i) => {
                    const found = e._id === episode._id;
                    if (found) {
                        episodeIndex = i;
                        episodeFound = true;
                    }
                    return found;
                });
                if (episodeFound) {
                    this.episodes = this.episodes.slice(0, episodeIndex).concat(this.episodes.slice(episodeIndex + 1));
                }
                this.currentEpisode = null;
                this.loadingCount--;
            } catch (e) {
                this.loadingCount--;
                throw new Error("An error ocurred while deleting an episode.");
            }
        }
    }

    @autobind
    @action
    public async updateOrCreatePodcast(podcast: IPodcast) {
        try {
            const response: any = await axios.post("/podcast", podcast);
            this.podcast = response.data;
            return response;
        } catch (e) {
            console.error(e);
        }
    }

    @autobind
    @action
    public async publishEpisode(episode: IEpisode) {
        try {
            if (!episode.published) {
                episode.published = true;
            }
            if (!episode.publishedAt) {
                episode.publishedAt = new Date();
            }
            await this.updateOrCreateEpisode(episode);
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Episode publish failed.");
        }
    }

    @autobind
    @action
    public async unpublishEpisode(episode: IEpisode) {
        try {
            episode.published = false;
            await this.updateOrCreateEpisode(episode);
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Episode unpublish failed.");
        }
    }

    @autobind
    @action
    public async updateOrCreateEpisode(episode: IEpisode) {
        try {
            // If the file has not finished uploading and this is the first upload then we don't publish the episode
            const published = episode.published;
            if (!episode.audioUrl) {
                episode.published = false;
            }
            const response: any = await axios.post("/episode", episode);
            if (response.data.podcast) {
                this.podcast = response.data.podcast;
            }
            response.data.episode.published = published;
            if (this.episodes.length) {
                let episodeIndex = -1;
                let episodeFound = false;
                this.episodes.find((e, i) => {
                    const found = e._id === episode._id;
                    if (found) {
                        episodeIndex = i;
                        episodeFound = true;
                    }
                    return found;
                });
                if (episodeFound) {
                    this.episodes = this.episodes
                        .slice(0, episodeIndex)
                        // tslint:disable-next-line:prefer-object-spread
                        .concat([response.data.episode])
                        .concat(this.episodes.slice(episodeIndex + 1));
                } else {
                    this.episodes = [response.data.episode, ...this.episodes];
                }
            } else {
                this.episodes = [response.data.episode];
            }
            this.currentEpisode = response.data.episode;
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Episode create or update failed.");
        }
    }

    @autobind
    @action
    public async uploadRssFeed(url: string, publish: boolean) {
        try {

            const response: any = await axios.post("/import-rss", { url, publish });

            if (response.status === 200) {

                const statusInterval = setInterval(async () => {

                    const res: any = await axios.get("/podcast");

                    this.podcast = res.data.podcast;
                    this.episodes = res.data.episodes;
                    this.importProgress = res.data.podcast.importProgress;

                    if ((this.importProgress as any).done) {
                        clearInterval(statusInterval);
                    }

                }, 1000);
            }

            return response;

        } catch (e) {
            throw new Error((e.response && e.response.data) || "Failed to import RSS feed");
        }
    }

    @autobind
    @action
    public async resetImport() {
        const response: any = await axios.post("/reset-import");
        this.importProgress = response.data.importProgress;
    }

    @autobind
    @action
    public async updatePodcastContactInformation(contact: IPodcastContactFields) {
        try {
            const response: any = await axios.post("/contact", contact);
            this.podcast = response.data;
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Podcast contact page update failed.");
        }
    }

    @autobind
    @action
    public async previewPodcastContactInformation(contact: IPodcastContactFields) {
        try {
            const contact_preview = {
                preview: { ...contact },
            };
            const response: any = await axios.post("/contact", contact_preview);
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Podcast contact page preview update failed.");
        }
    }

    @autobind
    @action
    public async previewPodcastInformation(data: IPodcast) {
        try {
            const podcast_preview = {
                ...this.podcast,
                preview: { ...data },
            };
            const response: any = await axios.post("/podcast", podcast_preview);
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Podcast contact page preview update failed.");
        }
    }

    @autobind
    @action
    public async updateOrCreateEpisodePreview(episode: IEpisode) {
        try {
            // We create an episode preview
            episode.published = false;
            episode.preview = true;
            const response: any = await axios.post("/episode", episode);

        } catch (e) {
            throw new Error((e.response && e.response.data) || "Episode create or update failed.");
        }
    }

    @autobind
    @action
    public async getUploadPolicy(file: File): Promise<{ uploadUrl: string, publicFileUrl: string }> {
        try {
            const response: any = await axios.get("/upload_policy", {
                params: { filename: file.name, type: file.type },
            });
            if (!response.data || !response.data.uploadUrl || !response.data.publicFileUrl) {
                throw new Error("Failed to get upload_policy.");
            }
            return response.data;
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Failed to get upload_policy.");
        }
    }

    @autobind
    @action
    public async uploadFileToCloudStorage(file: File, policyUrl: string, publicFileUrl?: string) {
        try {
            const uploadConfig: any = {
                headers: { "content-type": file.type },
            };
            uploadConfig.onUploadProgress = (progress: { loaded: number, total: number }) => {

                const progressEvent = progress;
                // tslint:disable-next-line:prefer-object-spread
                this.uploadProgress = Object.assign({}, this.uploadProgress, {
                    [publicFileUrl]: {
                        publicFileUrl,
                        progress,
                    },
                });

                let currentProgress = 0;

                if (publicFileUrl && progressEvent && progressEvent.loaded && progressEvent.total) {
                    currentProgress = Math.ceil((+progressEvent.loaded / progressEvent.total) * 100);
                    // If the download is finished we make a request to reflect the changes
                    if (currentProgress === 100) {
                        if (this.isAuthenticated && this.podcast && this.episodes.length) {
                            const currentEpisode = this.episodes.find(e => e.uploadUrl === publicFileUrl);
                            if (currentEpisode) {
                                currentEpisode.audioUrl = publicFileUrl;
                                this.updateOrCreateEpisode(currentEpisode);
                            }
                        }
                    }
                }
            };
            const uploadResponse: any = await axios.put(policyUrl, file, uploadConfig);
            // if (publicFileUrl) {
            // const response = await axios.post("/add_storage_usage", { url: publicFileUrl });
            // this.podcast = response.data.podcast;
            // }

            return uploadResponse;
        } catch (e) {
            // tslint:disable-next-line:prefer-object-spread
            this.uploadProgress = Object.assign({}, this.uploadProgress, {
                [publicFileUrl]: {
                    publicFileUrl,
                    error: "File upload failed! " + e,
                },
            });
            throw new Error((e.response && e.response.data) || "Failed to get upload_policy.");
        }
    }

    @autobind
    @action
    public async addImageEntry(url, episode, podcast) {
        try {
            const response = await axios.post("/images/add", { url, episode, podcast });
            if (response.data.images) {
                this.images = response.data.images;
            }
            return {
                status: "ok",
            };
        } catch (e) {
            return {
                status: "error",
            };
        }
    }

    @autobind
    @action
    public async deleteImage(id) {
        try {
            const response = await axios.post("/images/delete/" + id, {});
            const images = await axios.post("/images/find/podcast", { podcast: this.podcast._id });
            this.images = images.data.images;
            return {
                status: "ok",
            };
        } catch (e) {
            return {
                status: "error",
            };
        }
    }

    @autobind
    @action
    public async sendInviteForCollab(email: string) {
        try {
            const response = await axios.post("/invite-collaborator", { email });
            return {
                message: "An invitation was sent to user " + email,
                error: "",
            };
        } catch (e) {
            return {
                message: "An invitation could not be sent to user " + email,
                error: "",
            };
        }
    }

    @autobind
    @action
    public async submitPodcast() {
        try {
            const response = await axios.post("/submit-podcast", { podcastId: this.podcast._id, podcastTitle: this.podcast.title, podcastEmail: this.podcast.email, rssFeed:  "/p/" + this.podcast.slug + "/rss.xml"});
            return {
                message: "You will receive an email when your podcast is published.",
                error: "",
                status: 200,
            };
        } catch (e) {
            return {
                message: "Your podcast could not be submitted for publication.",
                error: "",
                status: 200,
            };
        }
    }

    @autobind
    @action
    public async removeCollaborators(collaborators: any[]) {
        try {
            const response = await axios.post("/remove-collaborators", { collaborators });
            this.podcast = response.data.podcast;
            return {
                message: "Collaborators removed sccessfully",
                error: "",
            };
        } catch (e) {
            return {
                message: "Failed to remove collaborators",
                error: "",
            };
        }
    }

    @autobind
    @action
    public async switchPodcast(podcastId: string) {
        try {
            const res = await axios.post("/switch-podcast", { podcastId });
            try {
                const response: any = await axios.get("/podcast");
                this.podcast = response.data.podcast;
                this.episodes = response.data.episodes;
                this.podcasts = response.data.podcasts;
                const billingHistory: any = await axios.post("/billing-history");
                this.billingHistory = _.get(billingHistory, "data.charges.data", []);
            } catch (e) {
                throw new Error((e.response && e.response.data) || "Failed to load podcast.");
            }
        } catch (e) {
            throw new Error((e.response && e.response.data) || "Failed to load podcast.");
        }
    }
}
export default new RootState();
