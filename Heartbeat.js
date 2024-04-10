// gifPlayer.js
let Heart_gif 
let lastBeatTime = 0;

 // Sound stuff
 let sound;
 let audioContext;
 let analyser;
 let microphoneStream;
 let bufferSize = 2048;
 let buffer = new Float32Array(bufferSize);
 let beatDetected = false;
 let peak = 0.0;
 let audioActive = false;

let xpos = 0;
let lasty = 0;
let lastx = 0;
let lastPeak = 0;
let fadeStartX = -100; // Starting x position for the fade, so it's initially offscreen
let fadeWidth = 50; // Width of the fading area

let ButtonsMenu; // Dynamic support for menu / mapped buttons

// fake debug out
const debugOut = {
	push: function(message) {
	  console.log(message);
	}
  };

function setup() {
    console.log('Heartbead:setup()');
    Heart_gif= document.getElementById('gif');
 // Setup audio
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('-- setting up audio 1 --');
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                console.log('-- setting up audio 2 --');
                microphoneStream = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser();
                analyser.fftSize = bufferSize * 2;
                microphoneStream.connect(analyser);
                audioActive = true;
                detectBeat();
            })
            .catch(function(err) {
                console.log('Error accessing microphone: ' + err);
            });
    } else {
        console.log('getUserMedia not supported in this browser.');
    }

    // setup canvas

    let container = select('#gif-container');
    drawing = createCanvas(1200, 800);
    drawing.parent(container);
    background(0, 0); // Transparent background
  
    // Set up the overlay canvas for the fading effect
    overlay = createGraphics(1200, 800);   
}


function detectBeat() {
    console.log('detectBeat');
    if (audioActive === true) {
        analyser.getFloatTimeDomainData(buffer);
        peak = getPeak(buffer);
        //console.log(`Peak: ${peak.toFixed(4)}`);
        if (peak > (lastPeak * 0.5) && !beatDetected) {
            //console.log('Beat detected!');
            beatDetected = true;
            lastBeatTime = getElapsedMillis();
            setTimeout(resetBeatDetection, 50); // Reset beat detection after 1/10 second
                //debugOut.push(`Beat, Peak: ${peak.toFixed(4)}`);
        } 
    } else {
        console.log('skipping, audio not initialised')
    }
}

function getPeak(buffer) {
    let peak = 0;
    for (let i = 0; i < buffer.length; i++) {
	let value = Math.abs(buffer[i]);
	peak = Math.max(peak, value);
    }
    return peak;
}

function resetBeatDetection() {
    beatDetected = false;
}

// Get the start time at some point
const startTime = performance.now();

// Function to calculate elapsed milliseconds since `startTime`
function getElapsedMillis() {
  const now = performance.now();
  return now - startTime;
}

function draw()
{
    var h = height /4 ;
    var y = h + peak * 4 * h;

	if (ButtonsMenu) { if (ButtonsMenu.ShowMenu()) return; } // check to display menu

    if (beatDetected === true) {
        lastPeak = peak;
    } else {
        y = h;
    }
    var y1 = h + lastPeak * 4 * h;
    fill(0, 255, 0); // Set the fill color to red
    stroke(0,128,0); // Set the line color to black
    strokeWeight(3); // Set the thickness of the line
    if (lasty === 0) lasty = y;
    line(lastx, lasty, xpos, y);

    stroke(0,255,0);
    if ((getElapsedMillis() - lastBeatTime)<100) {
        stroke(255,0,0);
        ellipse(xpos, y, 15, 15);
    } else {
        ellipse(xpos, y, 5, 5);
    }
    lasty = y;
    lastx = xpos;  
    xpos+=100; 

    if (xpos>width+5) { xpos = 0; lastx = xpos; clear(); }


 
}

function playGif() {
    let currentTime = getElapsedMillis();
    detectBeat();
    if (beatDetected && currentTime - lastBeatTime > 0) { // Check if a peak (beat) is detected
        let timeBetweenBeats = currentTime - lastBeatTime;
        let gifDuration = gif.duration * 1000; // duration in milliseconds
        let speed = gifDuration / timeBetweenBeats;
        gif.playbackRate = speed;
        lastBeatTime = currentTime;
    }
    requestAnimationFrame(playGif);
}

function keyPressed() {
	//console.log('keyPressed')
    strokeWeight(0);
	if (ButtonsMenu) { if (ButtonsMenu.menuKeyPressed(keyCode)) return; } // Give menu a change to capture
	//console.log('InvKeys')
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("Heartbeat:DOMContentLoaded");
    playGif();

    // Assuming your server is running on the same host and port 3000

    debugOut.push('DOMContentLoaded');
    // Assuming ButtonsMenu.js exports a default function or class
    import('./ButtonsMenu.js').then(module => {
        ButtonsMenu = module.default;
        // Now you can use ButtonsMenu
        ButtonsMenu.btnConnectWebSockets();
    }).catch(error => {
        console.error("Failed to load ButtonsMenu.js", error);
    });
});


