import { Document, model, Model, Schema } from "mongoose";
import { IPodcast } from "./podcast";

import * as maxmind from "maxmind";
import * as path from "path";

export async function getLocation(ip: string) {
    return new Promise((resolve, reject) => {
        maxmind.open(path.join(__dirname, "../../bin/GeoLite2-City.mmdb"), (err, cityLookup) => {
            if (err) { resolve({ country: null, city: null }); }
            const city = cityLookup.get(ip);
            maxmind.open(path.join(__dirname, "../../bin/GeoLite2-Country.mmdb"), (error, countryLookup) => {
                const country = countryLookup.get(ip);
                if (error) { resolve({ country: null, city: null }); }
                resolve({ country, city });
            });
        });
    });
}

export interface IAnalytic extends Document {
    headers: string;
    event: string;
    podcast: Schema.Types.ObjectId;
    episode: Schema.Types.ObjectId;
    createdAt?: Date;
    location?: any;
}

export interface IAnalyticModel extends Model<IAnalytic> {
    downloadEpisode(
        podcast: Schema.Types.ObjectId, episode: Schema.Types.ObjectId, headers: any, ip?: any,
    ): Promise<IAnalytic>;
}

const AnalyticSchema = new Schema({
    headers: { type: String, required: true },
    event: { type: String, required: true },
    podcast: { type: Schema.Types.ObjectId, ref: "Podcast", required: true },
    episode: { type: Schema.Types.ObjectId, ref: "Episode" },
    location: { type: Object },
}, { timestamps: { createdAt: "createdAt" } });

AnalyticSchema.statics.downloadEpisode = async function (
    podcast: Schema.Types.ObjectId, episode: Schema.Types.ObjectId, reqHeaders?: any, ip?: any,
): Promise<IAnalytic> {
    const Episode = require("./episode").default;
    const Podcast = require("./podcast").default;
    const time = new Date();
    time.setSeconds(0);
    time.setMilliseconds(0);
    const location = await getLocation(ip);
    // tslint:disable-next-line:max-line-length
    await Episode.collection.update(
        { _id: episode },
        {
            $inc: {
                downloadsCount: 1, [`statistics.${time.getTime()}`]: 1,
            },
        }, { upsert: true });

    await Podcast.collection.update(
        { _id: podcast },
        {
            $inc: {
                [`statistics.${time.getTime()}`]: 1,
            },
        }, { upsert: true });

    const event = "DownloadEpisode";
    const headersObj: any = {};
    if (reqHeaders) {
        headersObj.userAgent = reqHeaders["user-agent"];
        headersObj.referer = reqHeaders.referer;
    }
    const headers = JSON.stringify(headersObj);
    return (this as Model<IAnalytic>).create({ podcast, episode, headers, event, location });
};

export default model("Analytic", AnalyticSchema) as IAnalyticModel;
