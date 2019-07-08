import * as request from "request";
import * as slug from "slug";
import config from "../config";
import { logger } from "./logger";
// tslint:disable-next-line:no-var-requires
const storage = require("@google-cloud/storage");

const gcs = storage({
    projectId: config.google.storage.projectID,
    credentials: {
        client_email: config.google.storage.clientEmail,
        private_key: config.google.storage.privateKey,
    },
});

const bucket = gcs.bucket(config.google.storage.bucket);

export function getSignedUrlForUpload(filename: string, contentType: string) {
    // TODO: Validate content types
    return new Promise((resolve, reject) => {
        const file = bucket.file(filename);
        const urlConfig = {
            action: "write",
            expires: new Date().getTime() + (1000 * 60 * 10), // 10 minutes from now
            contentType,
        };
        file.getSignedUrl(urlConfig, (err: any, url: string) => {
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

    const bucketName = config.google.storage.bucket;

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
                    const bucketName = config.google.storage.bucket;
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
