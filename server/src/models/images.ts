import { Document, model, Schema } from "mongoose";

export interface IImages extends Document {
    podcast?: Schema.Types.ObjectId;
    episode?: Schema.Types.ObjectId;
    user?: Schema.Types.ObjectId;
    url: string;
}

const ImagesSchema = new Schema({
    podcast: { type: Schema.Types.ObjectId, required: false },
    episode: { type: Schema.Types.ObjectId, required: false },
    user: { type: Schema.Types.ObjectId, required: false },
    url: { type: String, required: true },
}, { timestamps: true });

export default model<IImages>("Images", ImagesSchema);
