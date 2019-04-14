import { Document, model, Schema } from "mongoose";
import { IPodcast } from "./podcast";

export interface ICompany extends Document {
    companyName: string;
    logo: string;
    podcastCategories: string;
    podcasts: any[];
}

const CompanySchema = new Schema({
    companyName: { type: String, required: true },
    logo: { type: String, required: false },
    podcastCategories: { type: String, required: false },
    podcasts: { type: Array, required: false },
}, { timestamps: true });

export default model<ICompany>("Company", CompanySchema);
