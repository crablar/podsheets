import { Document, model, Schema } from "mongoose";
import * as slug from "slug";
import config from "../config";

export interface IPodcast extends Document {
    title: string;
    subtitle: string;
    author: string;
    keywords: string;
    categories: string;
    owner: any[];
    imageUrl?: string;
    theme?: "light" | "dark" | "sky" | "silver" | "sand";
    layout?: "classic" | "minimalistic";
    slug?: string;
    createdAt?: Date;
    updatedAt?: Date;
    usedStorage?: number;
    storageReset?: Date;
    email?: string;
    about?: string;
    aboutPreview?: string;
    contactEmail?: string;
    contactFacebook?: string;
    contactTwitter?: string;
    contactMessage?: string;
    preview?: object;
    statistics?: object;
    subscription?: object;
    importProgress?: object;
    advertisingEnabled?: boolean;
    socialNetEnabled?: boolean;
    subscriptionEnabled?: string;
}

const PodcastSchema = new Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    author: { type: String, required: true },
    keywords: { type: String, required: true },
    categories: { type: String, required: true },
    imageUrl: { type: String },
    owner: { type: [Schema.Types.ObjectId] },
    slug: { type: String, required: true, unique: true },
    theme: { type: String, enum: ["light", "dark", "silver", "sand", "sky"], default: "light" },
    email: { type: String, required: false },
    about: { type: String, required: false },
    aboutPreview: { type: String, required: false },
    contactEmail: { type: String, required: false },
    contactFacebook: { type: String, required: false },
    contactTwitter: { type: String, required: false },
    contactMessage: { type: String, required: false },
    preview: { type: Object, required: false },
    layout: { type: String, required: false },
    statistics: { type: Object, required: false },
    subscription: { type: Object, required: false },
    importProgress: { type: Object, required: false },
    usedStorage: { type: Number, required: false, default: 0 },
    storageReset: { type: Date, required: false, default: new Date()},
    advertisingEnabled: { type: Boolean, default: false },
    socialNetEnabled: { type: Boolean, default: false },
    subscriptionEnabled: {type: String, default: config.subscription.enabled},
}, { timestamps: true });

PodcastSchema.pre("findOneAndUpdate", function (next) {
    if (this._update && this._update.title) {
        this._update.slug = slug(this._update.title);
    }
    next();
});

export default model<IPodcast>("Podcast", PodcastSchema);
