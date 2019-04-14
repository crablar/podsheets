import * as lamejs from "lamejs";

let sampleRate;
let mp3encoder;

function init(config) {
  console.warn(config);
  sampleRate = config.sampleRate;
}

function exportMP3(channel) {

  var t0 = performance.now();
  console.log("Starting export");
  let mp3Data = [];

  let mp3encoder = new lamejs.Mp3Encoder(1, 44100, 32); //mono 44.1khz encode to 128kbps
  console.warn(channel);
  let mp3Tmp = mp3encoder.encodeBuffer(channel); //encode mp3
 
  //Push encode buffer to mp3Data variable
  mp3Data.push(mp3Tmp);

  // Get end part of mp3
  mp3Tmp = mp3encoder.flush();

  // Write last data to the output data, too
  // mp3Data contains now the complete mp3Data
  mp3Data.push(mp3Tmp);

  var blob = new Blob(mp3Data, { type: 'audio/mp3' });
  var t1 = performance.now();
  console.log("Call to export took " + (t1 - t0) + " milliseconds.");
  postMessage(blob);
}

onmessage = function onmessage(e) {
  switch (e.data.command) {
    case 'init': {
      init(e.data.config);
      break;
    }
    case 'exportMP3': {
      console.warn(e);
      exportMP3(e.data.channel);
      break;
    }
    default: {
      throw new Error('Unknown export worker command');
    }
  }
};
