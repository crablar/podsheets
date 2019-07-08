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
    callbackURL: envVarsSchema.GOOGLE_CALLBACK_URL,
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
