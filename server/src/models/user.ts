import { Document, model, Model, Schema } from "mongoose";
import * as bcrypt from "twin-bcrypt";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    facebookId?: string;
    facebookToken?: string;
    googleId?: string;
    googleToken?: string;
    selectedPodcast?: Schema.Types.ObjectId;
    verified?: boolean;
}

export interface IUserModel extends Model<IUser> {
    getByEmailAndPassword(email: string, password: string): Promise<IUser>;
    signUp(firstName: string, lastName: string, email: string, password: string): Promise<IUser>;
}

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: { unique: true } },
    password: String,
    facebookId: String,
    facebookToken: String,
    googleId: String,
    googleToken: String,
    selectedPodcast: { type: Schema.Types.ObjectId, required: false },
    verified: { type: Boolean, required: false },
}, { timestamps: true });

UserSchema.pre("save", function (next) {
    // const user = this;
    if (!this.isModified("password")) { return next(); }
    bcrypt.hash(this.password, null, null, hash => {
        this.password = hash;
        next();
    });
});

UserSchema.statics.signUp = async function (
    firstName: string, lastName: string, email: string, password: string,
): Promise<IUser> {
    const userStored: IUser = await this.findOne({ email }).exec();
    if (userStored) {
        return Promise.reject(new Error("Another account is already registered with this email address."));
    }
    return (this as IUserModel).create({ firstName, lastName, email, password });
};

UserSchema.statics.getByEmailAndPassword = async function (email: string, password: string): Promise<IUser> {
    const user: IUser = await this.findOne({ email }).exec();
    if (!user) { return null; }
    return bcrypt.compareSync(password, user.password) ? user : null;
};

export default model("User", UserSchema) as IUserModel;
