const Heroku = require('heroku-client')
const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN })
const uuid = require('uuid/v1');
const podsheetsSocialPipeline = process.env.POD_SOCIAL_PIPELINE;
var fs = require('fs');
var readline = require('readline');
const MongoClient = require('mongodb').MongoClient;
const mongoHost = process.env.MONGODB_URI;
const mongoDatabaseName = mongoHost.substring(mongoHost.lastIndexOf('/') + 1, mongoHost.length);

function createApp() {
  const payload = {
    body: {
      //TODO: Remove test
      name: `podsheets-social-test-${uuid().slice(0, 8)}`,
      team: 'podsheets'
    }
  }
  return heroku.post('/teams/apps', payload)
}

function getPipelines() {
  return heroku.get('/pipelines')
}

function getPodsheetsSocialPipeline() {
  getPipelines().then(pipelines => {
    pipeline = pipelines.filter(p => {
      return p.name == 'podsheets-social'
    })
    console.log(pipeline[0].id)
  })
}

function getApps() {
  return heroku.get('/apps')
}

function getPodsheetSocialApps() {
  return getApps().then(d => {
    const apps = d.filter(app => {
      return app.name.indexOf('podsheets-social-') > -1;
    }).map(a => {
      return {id: a.id, name: a.name}
    })
    return Promise.resolve(apps)
  })
}

function deleteApp(name) {
  return heroku.delete(`/apps/${name}`)
}

function pipelineCouplings() {
  return heroku.get('/pipeline-couplings')
}

function createpipelineCoupling(appId) {
  return heroku.post('/pipeline-couplings', {
    body: {
      app: appId,
      pipeline: podsheetsSocialPipeline,
      stage: "production"
    }
  })
}

function createBuild(appName) {
  return heroku.post(`/apps/${appName}/builds`, {
    body: {
      source_blob: {
        checksum: null,
        url: 'https://github.com/andrewmarklloyd/sedaily-monorepo/archive/latest.tar.gz',
        version: 'latest'
      }
    }
  })
}

function updateConfigVars(appName) {
  var body = {}
  return new Promise((resolve, reject) => {
    readline.createInterface({
        input: fs.createReadStream('.env'),
        terminal: false
    }).on('line', function(line) {
      const l = line.split('=')
      body[l[0]] = l[1]
    }).on('close', function(){
      body.MONGO_COLLECTION_PREFIX = appName;
      body.BASE_URL = `https://${appName}.herokuapp.com`
      heroku.patch(`/apps/${appName}/config-vars`, {body})
      .then(result => {
        resolve(result)
      })
      .catch(e => {
        reject(e)
      })
    })
  })
}

function cleanupCollection(collection) {
  const client = new MongoClient();
  MongoClient.connect(mongoHost, (err,database) =>{
    const db = database.db(mongoDatabaseName)
    db.listCollections().toArray(function(err, collInfos) {
      collInfos = collInfos.filter(c => {
        return (c.name.indexOf(collection) == 0)
      })
      collInfos.forEach(c => {
        console.log('Dropping collection', c.name, '...')
        db.dropCollection(c.name, function(err, result) {
          if (err) {
            console.log(err)
          }
        })
      })
      db.close();
    })
  })
}

switch (process.argv[2]) {
  case 'clean':
    getPodsheetSocialApps().then(apps => {
      apps.forEach(app => {
        console.log('Deleting: ', app.name, '|', app.id)
        cleanupCollection(app.name)
        deleteApp(app.name).then(response => {
          console.log('Deleted app:', response.id)
        })
      })
    })
    break;
  case 'deploy':
    var appName;
    console.log('Creating app...')
    buildSocialNet()
   break;
  default:
    console.log('no args')
}

export const buildSocialNet = () => {
  createApp().then(app => {
    appName = app.name;
    console.log('App created, creating pipeline coupling...')
    createpipelineCoupling(app.id).then(coupling => {
      console.log('App coupled to pipeline, updating config...')
      updateConfigVars(app.name).then(patchedConfig => {
        console.log('Config updated, initiating build...')
        createBuild(appName).then(build => {
          console.log('Build initiated, getting build log...')
          fs.writeFileSync('./output_stream_url', build.output_stream_url);
        })
      })
    })
  })
  .catch(e => {
    console.log('Error', e)
  });
}