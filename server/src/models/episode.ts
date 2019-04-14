import { Document, model, Schema } from "mongoose";
import { IPodcast } from "./podcast";

export interface IEpisode extends Document {
    title: string;
    podcast: Schema.Types.ObjectId;
    published?: boolean;
    audioUrl?: string;
    uploadUrl: string;
    summary?: string;
    fullContent?: string;
    createdAt?: Date;
    updatedAt?: Date;
    publishedAt?: Date;
    downloadsCount?: number;
    preview?: boolean;
    audioDuration?: number;
    statistics?: object;
    guid: string;
    adPlacement?: object;
}

const EpisodeSchema = new Schema({
    title: { type: String, required: true },
    summary: { type: String },
    fullContent: { type: String },
    audioUrl: { type: String },
    uploadUrl: { type: String },
    publishedAt: { type: Date },
    published: { type: Boolean, default: false },
    podcast: { type: Schema.Types.ObjectId, ref: "Podcast", required: true },
    downloadsCount: { type: Number, default: 0 },
    preview: { type: Boolean, default: false },
    audioDuration: {type: Number, required: false, default: 1 },
    statistics: { type: Object, required: false },
    guid: { type: String },
    adPlacement: { type: Object },
}, { timestamps: true });

export default model<IEpisode>("Episode", EpisodeSchema);
