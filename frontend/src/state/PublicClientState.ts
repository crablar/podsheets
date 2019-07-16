import axios from "axios";
import { autobind } from "core-decorators";
import { action, observable } from "mobx";
import { IEpisode, IPodcast } from "../lib/interfaces";

declare function unescape(str: string): any;

export class PublicClientState {
    @observable.ref public podcast: IPodcast;
    @observable.ref public episodes: IEpisode[] = [];
    @observable.ref public currentEpisode: IEpisode = null;

    constructor() {
        this.rehidratate();
    }

    @autobind
    @action
    public async rehidratate() {
        const podcast = JSON.parse(unescape((window as any).podcast));
        const episodes = JSON.parse(unescape((window as any).episodes));
        if (podcast && episodes) {
            this.podcast = podcast;
            this.episodes = episodes;
        }
    }

    @autobind
    @action
    public async submitContactMessage(name: string, email: string, message: string, podcastEmail: string) {
        try {
            const response = await axios.post("/submit-contact-message", { podcastEmail, name, email, message });
            return {
                message: "Your message has been sent.",
                error: "",
                status: 200,
            };
        } catch (e) {
            return {
                message: "Your contact form could not be submitted.",
                error: "",
                status: 200,
            };
        }
    }
}
export default new PublicClientState();
