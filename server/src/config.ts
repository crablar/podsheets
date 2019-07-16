import * as dotenv from "dotenv";
import * as Joi from "joi";

dotenv.config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(["development", "production"])
    .default("development"),
  PORT: Joi.number()
    .default(3001),
  SESSION_SECRET: Joi.string().required()
    .description("Secret used to sign the session ID cookie"),
  MONGODB_URI: Joi.string().required()
    .description("Mongo DB connection string URI"),
  GOOGLE_CLIENT_ID: Joi.string().required()
    .description("Client id of Google app used for authentication"),
  GOOGLE_CLIENT_SECRET: Joi.string().required()
    .description("Client secret of Google app used for authentication"),
  GOOGLE_STORAGE_PROJECT_ID: Joi.string().required()
    .description("Project ID for storage bucket project"),
  GOOGLE_STORAGE_CLIENT_EMAIL: Joi.string().required()
    .description("Service account email for storage bucket project"),
  GOOGLE_STORAGE_PRIVATE_KEY: Joi.string().required()
    .description("Private key used for authentication of service account for storage bucket project"),
  GOOGLE_STORAGE_BUCKET: Joi.string().required()
    .description("Name of Google storage bucket"),
  FACEBOOK_CLIENT_ID: Joi.string().required()
    .description("Client ID for Facebook OAuth authentication"),
  FACEBOOK_CLIENT_SECRET: Joi.string().required()
    .description("Client secret for Facebook OAuth authentication"),
  FACEBOOK_CALLBACK_URL: Joi.string().required()
    .description("OAuth callback url for Facebook authentication"),
  SUBSCRIPTION_ENABLED: Joi.boolean()
    .description("Boolean setting whether or not to enable subscriptions"),
  STRIPE_PUBLISHABLE_KEY: Joi.string().required()
    .description("Identify the Stripe account"),
  STRIPE_SECRET_KEY: Joi.string().required()
    .description("Stripe API key used to make authenticated requests"),
  ITUNES_USERNAME: Joi.string()
    .description("Username associated with the iTunes account used to create podcasts"),
  ITUNES_PASSWORD: Joi.string()
    .description("Password associated with the iTunes account used to create podcasts"),
  HOSTNAME: Joi.string().required()
    .description("Hostname used for front end routing"),
  USER_ACCOUNTS_ENABLED: Joi.string().required()
    .description("Flag to allow sign in with Facebook and Google services"),
  AUDIO_EDITOR: Joi.boolean()
    .description("Flag to enable audio editor in the front end"),
  AD_PLACEMENT: Joi.boolean()
    .description("Flag to enable dynamic add placement in the front end"),
  IMPORT_RSS_ENABLED: Joi.boolean()
    .description("Flag to enable importing RSS feeds in the front end"),
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  session: {
    secret: envVars.SESSION_SECRET,
  },
  mongo: {
    uri: envVars.MONGODB_URI,
  },
  google: {
    client: {
      id: envVars.GOOGLE_CLIENT_ID,
      secret: envVars.GOOGLE_CLIENT_SECRET,
    },
    storage: {
      projectID: envVars.GOOGLE_STORAGE_PROJECT_ID,
      clientEmail: envVars.GOOGLE_STORAGE_CLIENT_EMAIL,
      // NOTE: Ugly hack for heroku variables (they actually add a \ to the variable string)
      privateKey: envVars.GOOGLE_STORAGE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      bucket: envVars.GOOGLE_STORAGE_BUCKET,
    },
    callbackURL: envVars.GOOGLE_CALLBACK_URL,
  },
  facebook: {
    client: {
      id: envVars.FACEBOOK_CLIENT_ID,
      secret: envVars.FACEBOOK_CLIENT_SECRET,
    },
    callbackURL: envVars.FACEBOOK_CALLBACK_URL,
  },
  subscription: {
    enabled: envVars.SUBSCRIPTION_ENABLED,
  },
  stripe: {
    publishableKey: envVars.STRIPE_PUBLISHABLE_KEY,
    secretKey: envVars.STRIPE_SECRET_KEY,
  },
  itunes: {
    username: envVars.ITUNES_USERNAME,
    password: envVars.ITUNES_PASSWORD,
  },
  hostname: envVars.HOSTNAME,
  userAccounts: {
    enabled: envVars.USER_ACCOUNTS_ENABLED,
  },
  audioEditor: envVars.AUDIO_EDITOR,
  adPlacement: envVars.AD_PLACEMENT,
  importRss: {
    enabled: envVars.IMPORT_RSS_ENABLED,
  },
};

export default config;
