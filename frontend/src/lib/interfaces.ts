export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    verified?: boolean;
}

export interface IPodcast {
    _id?: string;
    owner?: string[];
    title: string;
    subtitle: string;
    author: string;
    keywords: string;
    categories: string;
    imageUrl?: string;
    slug?: string;
    theme?: "light" | "dark" | "sky" | "silver" | "sand";
    layout?: "classic" | "minimalistic";
    createdAt?: Date;
    updatedAt?: Date;
    email?: string;
    about?: string;
    contactEmail?: string;
    contactMessage?: string;
    contactFacebook?: string;
    contactTwitter?: string;
    statistics?: object;
    storageLimit?: number;
    subscription?: any;
    importProgress?: object;
    advertisingEnabled?: boolean;
    socialNetEnabled?: boolean;
    subscriptionEnabled?: string;
}

export interface IEpisode {
    _id?: string;
    title: string;
    summary?: string;
    fullContent?: string;
    audioURL?: string;
    audioDuration?: number;
    uploadUrl?: string;
    published?: boolean;
    audioUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
    publishedAt?: Date;
    downloadsCount?: number;
    preview?: boolean;
    statistics?: object;
    adPlacement?: object;
}

export interface IUploadProgress {
    [index: string]: {
        progress: object;
        publicFileUrl: string;
        error?: string;
    };
}

export interface IImages extends Document {
    _id: string;
    podcast?: string;
    episode?: string;
    user?: string;
    url: string;
}
