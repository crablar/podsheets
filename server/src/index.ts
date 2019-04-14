// tslint:disable-next-line:no-reference
/// <reference path="./lib/types.d.ts" />
import * as sourcemap from "source-map-support";
sourcemap.install();

import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { logger } from "./lib/logger";

app.listen(process.env.PORT, () => {
    logger.info(`App is running at port 3001`);
});
