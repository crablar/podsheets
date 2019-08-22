# Podsheets [![Build Status](https://travis-ci.org/crablar/podsheets.svg?branch=master)](https://travis-ci.org/crablar/podsheets)
Open source tools for podcast hosting, ad management, community engagement, and more.

Join our [FindCollabs](https://findcollabs.com/project/IQNarf2tJ8Un4esfoXck) to find out how to contribute to Podsheets.

### Quick Setup
docker build -t podsheet .
docker-compose up

### Setup

- Install [Node.js](https://nodejs.org) v6.10.2 LTS

- Install [Yarn](https://yarnpkg.com/)

- Install [Mongodb](https://www.mongodb.com/download-center#community) 3.4.4

- Install nodemon

- Install webpack

Copy the file `./server/.env.sample` to `./server/.env` and edit the file with your credentials:
```sh
cp ./server/.env.sample ./server/.env
```

This credentials include the mongo url, and facebook and google api's secrets. For facebook and google api service, you have to create apps and turn on their authentication api's, there you can get the secret credentials needed. Note: Both google and facebook authentication apis will ask to set the hostname of the app at their UI, so if you are running it locally, you can add a hostname like `http://lvh.me:3000` to redirect to localhost.

#### Alternative to lvh url

Run this command:

```nano /etc/hosts```

add this entry at the end:

```127.0.0.1       podsheets.local```

Then do:
```ctrl X```

Indicate you'd like to save the change then press Enter.
Use this url for the application settings in FB and Google: http://podsheets.local:3001

Port 3000 is when running in dev mode, port 3001 is running in the mode it runs in Heroku.

After this is done, run:
```
yarn build
````

### Development workflow:

For development workflow, we need to run two consoles simultaneously:

For frontend, we we use webpack dev server to bundle and hot reload the application, open a new console and run:
```sh
cd ./frontend && yarn dev
```

For backend, we use nodemon and tsc to watch and transpile the typescript files, open a new console and run:
```sh
cd ./server && yarn dev
```

The webpack dev server will be available at `http://localhost:3000`

NOTE: This develpment configuration makes webpack server running at port 3000 and the backend server at port 3001, webpack will
automatically proxy all server requests to the server port.

**Errors**:

`Error occurred while trying to proxy request / from localhost:3000 to localhost:3001`

* Try changing server port to something like `4000` in `.env` and `webpack.config.js`

### Build for production:

```sh
yarn build
```

This will build frontend and server, and copy the assets from the frontend to the server.

To start the prod build server:
```sh
yarn start
```

The server will be available at `http://localhost:3001` (or the port configured at .env)

### Setting up the google cloud storage service

Go to the google cloud console >> Google Cloud Storage JSON API >> Credentials.
There you create a new service account with IAM permissions to writing to the storage bucket. After that you can download the credentials json file.
From that file you can copy and paste the credentials to `.env`.

Then you can create a new bucket for the storage and set the permissions to public read, so users can download the files.
```
gsutil defacl set public-read gs://podsheets-<name>

# Alternative method to set all to read access:
# gsutil defacl ch -u allUsers:R gs://podsheets-<name>
```

Add CORS so the front end can read/write
```
echo '[{"origin": ["*"],"responseHeader": ["Content-Type"],"method": ["GET", "HEAD", "POST", "PUT"],"maxAgeSeconds": 3600}]' > cors-config.json
gsutil cors set cors-config.json gs://podsheets-<name>
gsutil cors get gs://podsheets-<name>
```

### Deploying to Heroku:

You need to install heroku cli on your local machine. Then from the root of this repo type:
```sh
heroku login
```
And enter your credentials, then link the repo with the heroku repo (where `podsheetsqa` is the name of the heroku app)

```sh
heroku git:remote -a podsheetsqa
```

Then you can commit the changes with:
```sh
 git push heroku master
```

NOTE: At the moment we have to commit the bundled files at `./server/public` to the github repo. This is because heroku complains of a build time longer than 60 seconds. So before sending a new build to heroku, make sure you first run `yarn build` and commit the changes inside `./server/public`.

### Configuring Transaction email:
Any transaction email service can be used which supports SMTP credentials.
The following assumes that [mailgun](https://www.mailgun.com/) is used:

 1. Log In / Create a [mailgun](https://www.mailgun.com/) account.
 2. In the dashboard scroll down to Sending Domains or Sandbox Domains
 3. Either create a `Sending Domain` or open an existing Sending/Sandbox domain
 4. After opening the domain, note its `Domain Information` (SMTP Hostname, Default SMTP Login, Default Password)
 5. Go to [Heroku](https://dashboard.heroku.com/) and open the desired app -> settings -> Reveal Config Vars
 6. Fill SMTP_HOST, SMTP_PASSWORD, SMTP_USER with the corresponding [mailgun](https://www.mailgun.com/) SMTP credentials (SMTP Hostname, Default Password, Default SMTP Login)
 7. Now the [Heroku](https://dashboard.heroku.com/) app will use the new SMTP credentials to send transaction emails

### Configuring Stripe:

 1. Log In / Create a [Stripe](https://dashboard.stripe.com) account
 2. Go to `API` section
 3. Copy Publishable and Secret keys
 4. Go to [Heroku](https://dashboard.heroku.com/) and open the desired app -> settings -> Reveal Config Vars
 5. Fill STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY with the corresponding [Stripe](https://dashboard.stripe.com) keys which were noted earlier (Publishable and Secret)
 6. Now the [Heroku](https://dashboard.heroku.com/) app will use the new [Stripe](https://dashboard.stripe.com) credentials to process payments

To test both SMTP and Stripe configurations all steps are the same, but instead of editing Heroku config vars modify the local .env file in your project server directory.
