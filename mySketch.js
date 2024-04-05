/**
 * Kaleidoscope   by GaryGeo.
 * 
 *Move around the mouse to explore other parts of the web cam capture.
 *Press the up and down arrows to add mirrored slices
 *Press s to save.
 *
 *This is a port of my previous .pde kaleidoscope which was inspired with the by Devon Eckstein's Hexagon Stitchery
 *and his use of Mask.  His original sketch is archived at http://www.openprocessing.org/visuals/?visualID=1288
 */


 let totalSlices = 16; // the number of slices the image will start with... should be divisable by 4
 let cWidth = 1400;
 let cHeight = 1024;
 let capture;
 let vid;
 let offsetAngle = 0;
 let offsetAngleSpeed = 1.0; // Initial rotation speed
 let selectionmask;
 let w,h;
 let aspect_ratio = 1.6; // Stretch factor when projecting at 40 degrees
 let slice;
 let buttonsStatus = 0
 const debugLines = 5;

 // Sound stuff
 let sound;
 let audioContext;
 let analyser;
 let microphoneStream;
 let bufferSize = 2048;
 let buffer = new Float32Array(bufferSize);
 let beatDetected = false;
 let peak = 0.0;

function preload() {
    sound = loadSound('sounds/ping.mp3');
}

let ButtonsMenu; // Dynamic support for menu / mapped buttons

class DebugStringQueue {
  constructor(logFilePath) {
    this.queue = [];
    this.capacity = debugLines; // Maximum number of strings in the queue
    this.logFilePath = logFilePath; // Path to the logfile
    this.pusheditems = 0;
  }

  // Method to add a new string to the queue
  push(newString) {
    // Check if the queue has reached its capacity
    if (this.queue.length > this.capacity) {
        // Remove the oldest string (first element)
        this.queue.shift();
    }
    // Increment the count of pushed items
    this.pusheditems++;
    // Add the new string to the end of the queue, prefixed with its push order
    this.queue.push(`${this.pusheditems}) ${newString}`);
    console.log(newString);

    // Append the new string to the logfile
    // this.appendStringToLogFile(newString);
  }

  // Method to get the current state of the queue
  getQueue() {
    return this.queue;
  }

  getCount() {
    return this.queue.length;
  }
  
  appendStringToLogFile(string) {
    // Ensure the string ends with a newline for readability in the log file
   console.log(string);
  }

  // Method to access a string by its ordinal (index)
  getByIndex(index) {
    if (index >= 0 && index < this.queue.length) {
      return this.queue[index];
    }
    return null; // Return null if the index is out of bounds
  }
}

const debugOut = new DebugStringQueue('./sauronDebug'); // Sadly can't create files in static js :(

function enterFullscreen() {
   if (document.documentElement.requestFullscreen) {
     document.documentElement.requestFullscreen();
   } else if (document.documentElement.mozRequestFullScreen) { // Firefox 
     document.documentElement.mozRequestFullScreen();
   } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari & Opera 
     document.documentElement.webkitRequestFullscreen();
   } else if (document.documentElement.msRequestFullscreen) { // IE/Edge 
     document.documentElement.msRequestFullscreen();
   }
 }
 
 function simulateClick() {
   document.getElementById('fullscreen-button').click();
 }

const debugFontSize = 22;
 
 
 function setup() {
     debugOut.push('setup');

     cnv = createCanvas(cWidth, cHeight);

     // Debug output canvas
     textGraphics = createGraphics(400, 20 + debugFontSize * debugLines); // Room for x lines of debug
     textGraphics.textSize(debugFontSize);
     textGraphics.fill(255);

     capture = createCapture(VIDEO);
     capture.hide();
     //fullscreen(true);
     background(0,0,64); // Flash green set up background
     let fsButton = createButton('Toggle Fullscreen');
     fsButton.mousePressed(toggleFullscreen);
     w = int(cWidth / 3.7); //3.2 -  Changed to ensure that the image mostly fills 1440 x 1024 window on both R-pi & Mac
     h = int(cHeight / 3.1); //3.2
     selection_mask = createGraphics(w, h); //creates an off screen renderer

      //the width and height parameters for the mask
     //create a mask of a slice of the original image.
     selection_mask.noStroke();
     selection_mask.beginShape();

     slice = createImage(w, h); // Create a single slice object once on setup

     frameRate(30); // Attempt to limit refresh at 30 fps

     debugOut.push('Setting up Audio');

     // Setup audio
     audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

     debugOut.push('setup complete')
 }
 
 function toggleFullscreen() {
   let fs = fullscreen();
   fullscreen(!fs);
 }
 
 function draw() {

  if (ButtonsMenu) { if (ButtonsMenu.ShowMenu()) return; } // check to display menu
 
  background(0); // black background

  push();
  translate(cWidth / 2, cHeight /2);

  // Output FPS Count
  textGraphics.clear(); // Clear previous frame text
  buttonBits = buttonsStatus & 0b11111;
  buttonStateBinary = buttonBits.toString(2).padStart(5, '0');

  // Display FPS and button state
  textGraphics.text(`FPS:${frameRate().toFixed(0)} BTNs:${buttonStateBinary} P:${peak.toFixed(2)}`, 10, 15);    

  // Ourput Debug
  for(let i = 0; i < debugOut.getCount(); i++) { 
      let dstring;
dstring = debugOut.getByIndex(i);
      if (dstring != null) {
    textGraphics.text(dstring, 10, 18 + debugFontSize * (i+1));
      } else {
    textGraphics.text(".", 10, 18 + debugFontSize * (i+1));
}
  }

  // Draw the 2D graphics buffer onto the main canvas
  image(textGraphics, -cWidth / 2, -cHeight / 2);

    if (capture.loadedmetadata == true) {
            //background(0); // black background
            selection_mask.arc(0, 0, 2 * w, 2 * h, 0, radians(370 / totalSlices + .1)); //adding a little extra to hide edges
            var wRatio = float(cWidth - w) / float(width);
            var hRatio = float(cHeight - h) / float(height);

            // Ensure capture is ready and dimensions are valid
          if (capture.elt.readyState === capture.elt.HAVE_ENOUGH_DATA && w > 0 && h > 0) {
              // Now safely attempt to get and manipulate `slice`
              slice = capture.get(Math.floor((offsetAngle/2) * wRatio), Math.floor((offsetAngle/2) * hRatio), w, h);
              if (slice) {
                  slice.mask(selection_mask);
              }
          }

            //translate(width / 8, height / 4);
            var scaleAmt = 1.15; // overall size
            scale(scaleAmt);
            //apply slice in a circle
            scale(aspect_ratio, 1.0);  // Increase to stretch more horizontally
            rotate(radians(offsetAngle));
            for (k = 0; k <= totalSlices; k++) {
                rotate(k * radians(360 / (totalSlices / 2)));

    blendMode(BLEND);
                image(slice, 0, 0);
                scale(-1.0, 1.0);
                image(slice, 0, 0);
                scale(-1.0, 1.0);

                
        if (beatDetected && k%2) {
    fill(offsetAngle % 255, (offsetAngle+100) % 255, (offsetAngle + 200) % 255); // Color cycle by angle
    //blendMode(DARKEST);
    //for (let i = 1; i <= 4; i++) 
    i = 4;
    ellipse(i * 100, 0, i * peak * 10, i * peak * 50); // Draw an additional ellipse
    
        }
    }
  
        offsetAngle = (offsetAngle + offsetAngleSpeed) % 720;
        resetMatrix();
        selection_mask.clear();
    } else {
  // debugOut.push('capture failed'); - We get a number of these in startup
      // console.log(capture.loadmetadata); // Explain why capture fails
        background(255,0,0); // Set background to red to indicate capture fail...
    }


    pop();

  }


 // Key functions change the number of slices and save the image
 function keyPressed() {
     debugOut.push(`Key Pressed: ${keyCode}`); // Explain why capture fails
     if (sound.isPlaying()) {
        // If the sound is already playing, stop it
        sound.stop();
     } else {
        // Otherwise, play the sound
        sound.play();
     }

     //console.log(ButtonsMenu)
     if (ButtonsMenu) { if (ButtonsMenu.menuKeyPressed(keyCode)) return; } // Give menu a change to capture

     switch (keyCode) {
         case 38: //up arrow
             totalSlices = (totalSlices + 4) % 64;
             if (totalSlices == 0) { //jump over zero
                 totalSlices = 4;
             }
             debugOut.push(totalSlices)
             break;
         case 40: //down arrow
             totalSlices = (totalSlices - 4) % 64;
             if (totalSlices == 0) { //jump over zero
                 totalSlices = 64;
             }
             debugOut.push(totalSlices)
             break;
         case 83: //s for save
             saveCanvas(cnv, 'kaleidoscope', 'jpg');
             break;
         case LEFT_ARROW: // Left arrow key
             offsetAngleSpeed -= 0.1; // Decrease the rotation speed
             break;
         case RIGHT_ARROW: // Right arrow key
             offsetAngleSpeed += 0.1; // Increase the rotation speed
             break;
	       case 65: // A for changing aspect ratio - We should put this behind the backdoor menu
	        if (aspect_ratio == 1.1) { 
		          aspect_ratio = 1.6; 
	            } else {
                aspect_ratio = 1.1;
	            }     
	         break;
         case 72: // H key or Home button - should reset the functionality, also may use as a start of backdoor menu?
             debugOut.push('Home Key Pressed');
             break;
     }
 }


function loadDrawSketch() {
  // Dynamically load the draw sketch JavaScript file
  const script = document.createElement('script');
  script.src = 'Heartbeat.js';
  document.body.appendChild(script);
}

// This event may be handy when coding things like base movement in space invaders
function keyReleased() {
     debugOut.push(`Key Released: ${keyCode}`); // Explain why capture fails
}

function detectBeat() {
    analyser.getFloatTimeDomainData(buffer);
    peak = getPeak(buffer);
    //debugOut.push(`Peak: ${peak.toFixed(4)}`);
    if (peak > 0.1 && !beatDetected) {
	console.log('Beat detected!');
	beatDetected = true;
	setTimeout(resetBeatDetection, 50); // Reset beat detection after 1/10 second
        debugOut.push(`Beat, Peak: ${peak.toFixed(4)}`);
    }
    requestAnimationFrame(detectBeat);
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

document.addEventListener('DOMContentLoaded', () => {
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