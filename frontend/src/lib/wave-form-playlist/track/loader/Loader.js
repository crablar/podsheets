import EventEmitter from 'event-emitter';
import * as decode from 'audio-decode';
const buffer = require('audio-lena/mp3');

export const STATE_UNINITIALIZED = 0;
export const STATE_LOADING = 1;
export const STATE_DECODING = 2;
export const STATE_FINISHED = 3;


export default class {
  constructor(src, audioContext, ee = EventEmitter()) {
    this.src = src;
    this.ac = audioContext;
    this.audioRequestState = STATE_UNINITIALIZED;
    this.ee = ee;
  }

  setStateChange(state) {
    this.audioRequestState = state;
    this.ee.emit('audiorequeststatechange', this.audioRequestState, this.src);
  }

  fileProgress(e) {
    let percentComplete = 0;

    if (this.audioRequestState === STATE_UNINITIALIZED) {
      this.setStateChange(STATE_LOADING);
    }

    if (e.lengthComputable) {
      percentComplete = (e.loaded / e.total) * 100;
    }

    this.ee.emit('loadprogress', percentComplete, this.src);
  }

  fileLoad(e) {
    const audioData = e.target.response || e.target.result;

    this.setStateChange(STATE_DECODING);

    return new Promise(async (resolve, reject) => {

      decode(audioData).then(audioBuffer => {
        // console.warn(audioBuffer);
        resolve(audioBuffer);
      }, err => {
        console.error(err);
        reject(err);
      });
      /*
      this.ac.decodeAudioData(
        audioData,
        (audioBuffer) => {
          this.audioBuffer = audioBuffer;
          this.setStateChange(STATE_FINISHED);

          resolve(audioBuffer);
        },
        (err) => {
          reject(err);
        },
      );
    });
    */

    });
  }

}
