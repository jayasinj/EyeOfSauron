/* Code to load, initalize, and allow selection between scripts - Spacetime */

console.log('sauronMenu:');

import('./sharedState.js').then(sharedStateModule => {
    const { setPeak, setBeatDetect } = sharedStateModule;
    // Use setPeak, setBeatDetect...
    console.log('sharedState loaded:');
  });
  
  import('./Kaleido.js').then(KaleidoModule => {
    const { Kaleido } = KaleidoModule;
    // Use Kaleido...
    console.log('Kaleido loaded:');
  });
  
  // Declare debugOut at a higher scope
  let debugOut;

  import('./debugOut.js').then(debugOutModule => {
    const { debugOut } = debugOutModule;
    initializeApplication();
    // Use debugOut...
    console.log('debugOut loaded:');
  }).catch(error => {
    console.error("Error debugOut module:", error);
  });

function initializeApplication() {
    debugOut("debugOut Active");
}

// import { setPeak, setBeatDetect } from './sharedState.js';
// import { Kaleido } from "./Kaleido.js";
//import { debugOut } from './debugOut.js'

console.log('Kaleido loaded:');

//import { Heartbeat } from './Heartbeat.js';


//let currentSketch = Kaleido;

 // Sound stuff
 let analyser;
 let microphoneStream;
 let bufferSize = 2048;
 let buffer = new Float32Array(bufferSize);


// Define AudioContext globally
let sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();

/*let kaleido = function(sharedAudioContext) {
  return function(p) {

    p.setup = function() {
        Kaleido.setup(p,sharedAudioContext);
    };
    
    p.draw = function() {
        Kaleido.draw(p);
    }
  };
};*/
/*
let heartbeat = function(sharedAudioContext) {
  return function(p) {
    p.setup = function() {
      // Use sharedAudioContext here as well
      p.heartbeat.setup(sharedAudioContext)
    };
    // More setup and draw functions
    p.draw = function() {
      p.heartbeat.draw(sharedAudioContext)
    }
  };
};*/

function setup()
{
    debugOut.push('sauronMenu:setup')
}

function draw()
{
    debugOut.push('sauronMenu:draw')
}

function resumeSharedAudio() {
    // Check if AudioContext is in a suspended state (due to browser autoplay policies)
    if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume();
    }

    // Your existing setupSharedAudio code with corrections
}


function setupSharedAudio()
{
    if (sharedAudioContext) {
        // Setup audio
        resumeSharedAudio();
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function (stream) {
                        microphoneStream = audioContext.createMediaStreamSource(stream);
                        analyser = audioContext.createAnalyser();
                        analyser.fftSize = bufferSize * 2;
                        microphoneStream.connect(analyser);
                        detectBeat();
                })
                .catch(function (err) {
                    debugOut.push('Error accessing microphone:', err);
                });
            } else {
            debugOut.push('getUserMedia not supported in this browser.');
            }
        } else {
            console.log('sauronMenu:No Audio Context Object');
        }
}

// Start up with Kaleidoscope
console.log('sauronMenu: module loaded');
//new p5(kaleido(sharedAudioContext), 'sketch-container');

document.addEventListener('DOMContentLoaded', () => {
    // Assuming your server is running on the same host and port 3000

    debugOut.push('sauronMenu:DOMContentLoaded');
    new p5(kaleido(sharedAudioContext), 'sketch-container'); 
    
});



//new p5(kaleido(sharedAudioContext));
//new p5(sketch2(sharedAudioContext));


// Common to all, beat detect

function detectBeat() {
    analyser.getFloatTimeDomainData(buffer);
    let peak = findPeak(buffer);
    setPeak(peak);
    //debugOut.push(`Peak: ${peak.toFixed(4)}`);
    if (peak > 0.1 && !beatDetected) {
	console.log('Beat detected!');
    setBeatDetect(true);
	setTimeout(resetBeatDetection, 50); // Reset beat detection after 1/10 second
        debugOut.push(`Beat, Peak: ${peak.toFixed(4)}`);
    }
    requestAnimationFrame(detectBeat);
}

function findPeak(buffer) {
    let peak = 0;
    for (let i = 0; i < buffer.length; i++) {
        let value = Math.abs(buffer[i]);
        peak = Math.max(peak, value);
    }
    return peak;
}

function resetBeatDetection() {
    setBeatDetect(false);
}

console.log('End sauronMenu');