import Loader from './Loader';

import * as decode from 'audio-decode';

export default class extends Loader {

  /*
  * Loads an audio file via a FileReader
  */
  load() {
    return new Promise((resolve, reject) => {
      if (this.src.type.match(/audio.*/) ||
        // added for problems with Firefox mime types + ogg.
        this.src.type.match(/video\/ogg/)) {
        const fr = new FileReader();

        fr.readAsArrayBuffer(this.src);

        fr.addEventListener('progress', (e) => {
          super.fileProgress(e);
        });

        fr.addEventListener('load', (e) => {
          const decoderPromise = super.fileLoad(e);

          decoderPromise.then((audioBuffer) => {
            resolve(audioBuffer);
          });
        });

        fr.addEventListener('error', (err) => {
          reject(err);
        });
      } else {
        reject(Error(`Unsupported file type ${this.src.type}`));
      }
    });
  }
}

function fileLoad(e) {
    const audioData = e.target.response || e.target.result;

    return new Promise(async (resolve, reject) => {

      decode(audioData).then(audioBuffer => {
        console.warn(audioBuffer);
        resolve(audioBuffer);
      }, err => {
        console.error(err);
        reject(err);
      });
      
    });
  }

export function blobLoader(src, progressCallback) {
  return new Promise((resolve, reject) => {
    if (src.type.match(/audio.*/) ||
      // added for problems with Firefox mime types + ogg.
      src.type.match(/video\/ogg/)) {
      const fr = new FileReader();

      fr.readAsArrayBuffer(src);

      fr.addEventListener('progress', (e) => {
        if(progressCallback){
          progressCallback(e);
        }
      });

      fr.addEventListener('load', (e) => {
        const decoderPromise = fileLoad(e);

        decoderPromise.then((audioBuffer) => {
          resolve(audioBuffer);
        });
      });

      fr.addEventListener('error', (err) => {
        reject(err);
      });
    } else {
      reject(Error(`Unsupported file type ${src.type}`));
    }
  });
}
