import { Document, model, Schema } from "mongoose";

export interface IEmail extends Document {
    user: Schema.Types.ObjectId;
    podcast?: Schema.Types.ObjectId;
    transaction: "invite" | "verification" | "submission";
}

const EmailSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true },
    podcast: { type: Schema.Types.ObjectId, required: false },
    transaction: { type: String, required: true },
}, { timestamps: true });

export default model<IEmail>("Email", EmailSchema);
