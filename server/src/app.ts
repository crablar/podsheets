import * as bodyParser from "body-parser";
import * as connectMongo from "connect-mongo";
import * as cors from "cors";
import * as express from "express";
import * as es6Renderer from "express-es6-template-engine";
import * as httpsRedirect from "express-https-redirect";
import * as session from "express-session";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import * as passport from "passport";
import * as path from "path";
import config from "./config";
import * as auth from "./lib/auth";
import { stream } from "./lib/logger";
import addAuthRoutes from "./routes/auth";
import addEpisodesRoutes from "./routes/episodes";
import addImagesRoutes from "./routes/images";
import addMainRoutes from "./routes/main";
import addPodcastsRoutes from "./routes/podcasts";

import addSubscriptionRoutes, { stripeWebhook } from "./routes/subscription";
(mongoose as any).Promise = Promise;
mongoose.connect(config.mongo.uri);

const MongoStore = connectMongo(session);
const app = express();
const router = express.Router();

app.engine("html", es6Renderer);
app.set("views", "views");
app.set("view engine", "html");
app.set("x-powered-by", false);

app.use("/", httpsRedirect(config.env === "production" ? true : false));
app.use(cors());

app.use(morgan("dev", { stream }));
app.use(express.static("public"));

app.use(session({
    secret: config.session.secret,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json({ limit: "0.10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "0.10mb" }));
addMainRoutes(router);
addAuthRoutes(router);
addPodcastsRoutes(router);
addEpisodesRoutes(router);
addSubscriptionRoutes(router);
addImagesRoutes(router);

app.post("/stripe", (req, res) => stripeWebhook(req, res));

app.use("/", router);

export default app;
