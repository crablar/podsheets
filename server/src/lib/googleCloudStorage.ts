import * as request from "request";
import * as slug from "slug";
import { logger } from "./logger";
// tslint:disable-next-line:no-var-requires
const storage = require("@google-cloud/storage");

const gcs = storage({
    projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_STORAGE_CLIENT_EMAIL,
        // NOTE: Ugly hack for heroku variables (they actually add a \ to the variable string)
        private_key: process.env.GOOGLE_STORAGE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
});

const bucket = gcs.bucket(process.env.GOOGLE_STORAGE_BUCKET);

export function getSignedUrlForUpload(filename: string, contentType: string) {
    // TODO: Validate content types
    return new Promise((resolve, reject) => {
        const file = bucket.file(filename);
        const config = {
            action: "write",
            expires: new Date().getTime() + (1000 * 60 * 10), // 10 minutes from now
            contentType,
        };
        file.getSignedUrl(config, (err: any, url: string) => {
            if (err) {
                logger.error("Google Cloud Storage Error: ", err);
                reject(err);
            } else {
                resolve(url);
            }
        });
    });
}

export function deleteFile(url: string) {

    const bucketName = process.env.GOOGLE_STORAGE_BUCKET;

    return new Promise((resolve, reject) => {
        const filename = url.replace(`http://storage.googleapis.com/${bucketName}/`, "");
        bucket
            .file(filename)
            .delete()
            .then(() => {
                resolve({ status: "ok" });
            })
            .catch((err) => {
                resolve({ status: "error", message: err });
            });
    });

}

export function saveToStorage(attachmentUrl, objectName) {

    return new Promise((resolve, reject) => {
        const req = request(attachmentUrl);
        req.pause();
        req.on("response", res => {
            // Don't set up the pipe to the write stream unless the status is ok.
            if (res.statusCode !== 200) {
                return;
            }
            slug.defaults.mode = "rfc3986";
            const secureFilename = `${new Date().getTime()}/${slug(objectName)}`;
            // tslint:disable-next-line:no-console
            const writeStream = bucket.file(secureFilename)
                .createWriteStream({

                    // Tweak the config options as desired.
                    gzip: false,
                    public: true,
                    resumable: true,
                    metadata: {
                        contentType: res.headers["content-type"],
                    },
                });
            req.pipe(writeStream)
                .on("finish", () => {
                    const bucketName = process.env.GOOGLE_STORAGE_BUCKET;
                    const publicFileUrl = `http://storage.googleapis.com/${bucketName}/${secureFilename}`;
                    resolve(publicFileUrl);
                })
                .on("error", err => {
                    writeStream.end();
                    reject(err);
                });

            // Resume only when the pipe is set up.
            req.resume();
        });
        req.on("error", err => reject(err));
    });
}
