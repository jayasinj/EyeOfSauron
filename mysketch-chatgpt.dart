/**
 * Kaleidoscope   by GaryGeo.
 * 
 * Move around the mouse to explore other parts of the web cam capture.
 * Press the up and down arrows to add mirrored slices
 * Press s to save.
 *
 * This is a port of my previous .pde kaleidoscope which was inspired with the by Devon Eckstein's Hexagon Stitchery
 * and his use of Mask.  His original sketch is archived at http://www.openprocessing.org/visuals/?visualID=1288
 */

let totalSlices = 16; // the number of slices the image will start with... should be divisible by 4
let cWidth = 1400;
let cHeight = 1024;
let capture;
let vid;
let offsetAngle = 0;
let menuOption = 1;
let menuActive = true;
let buttonSequence = [];

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

function setup() {
  console.log("setup");
  cnv = createCanvas(cWidth + 00, cHeight);
  capture = createCapture(VIDEO);
  capture.hide();
  background(0);
  let fsButton = createButton('Toggle Fullscreen');
  fsButton.mousePressed(toggleFullscreen);
}

function toggleFullscreen() {
  let fs = fullscreen();
  fullscreen(!fs);
}

function draw() {
  if (menuActive) {
    drawMenu();
  } else {
    drawKaleidoscope();
  }
}

function drawMenu() {
  background(0);
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Menu", width / 2, height / 2 - 50);
  text("1. Change Rotation", width / 2, height / 2);
  text("2. Change Slices", width / 2, height / 2 + 50);
  text("3. Go", width / 2, height / 2 + 100);

  switch (menuOption) {
    case 1:
      fill(255, 0, 0);
      text("1. Change Rotation", width / 2, height / 2);
      break;
    case 2:
      fill(255, 0, 0);
      text("2. Change Slices", width / 2, height / 2 + 50);
      break;
    case 3:
      fill(255, 0, 0);
      text("3. Go", width / 2, height / 2 + 100);
      break;
  }
}

function drawKaleidoscope() {
  if (capture.loadedmetadata == true) {
    background(0);
    //the width and height parameters for the mask
    var w = int(width / 3.2);
    var h = int(height / 3.2);
    //create a mask of a slice of the original image.
    var selection_mask;
    selection_mask = createGraphics(w, h); //creates an off screen renderer
    selection_mask.noStroke();
    selection_mask.beginShape();
    // selection_mask.smooth();  //causes graphics error in open processing
    selection_mask.arc(0, 0, 2 * w, 2 * h, 0, radians(370 / totalSlices + .1)); //adding a little extra to hide edges
    var wRatio = float(cWidth - w) / float(width);
    var hRatio = float(cHeight - h) / float(height);
    var slice = createImage(w, h);
    slice = capture.get(int((offsetAngle / 2) * wRatio), int((offsetAngle / 2) * hRatio), w, h);
    slice.mask(selection_mask);
    translate(width / 2, height / 2);
    var scaleAmt = 1.15; // overall size
    scale(scaleAmt);
    //apply slice in a circle
    scale(1.5, 1.0); // Increase to stretch more horizontally
    rotate(radians(offsetAngle));
    for (k = 0; k <= totalSlices; k++) {
      rotate(k * radians(360 / (totalSlices / 2)));
      image(slice, 0, 0);
      scale(-1.0, 1.0);
      image(slice, 0, 0);
      scale(-1.0, 1.0);
    }

    offsetAngle = (offsetAngle + 1.0) % 720
    resetMatrix();
  }
}

// Key functions change the number of slices and save the image
function keyPressed() {
  if (menuActive) {
    switch (keyCode) {
      case UP_ARROW:
        menuOption = (menuOption > 1) ? menuOption - 1 : 3;
        break;
      case DOWN_ARROW:
        menuOption = (menuOption < 3) ? menuOption + 1 : 1;
        break;
      case ENTER:
        if (menuOption === 3) {
          menuActive = false;
        }
        break;
    }
  } else {
    if (keyCode === DOWN_ARROW) {
      buttonSequence.push("down");
      if (buttonSequence.length > 4) {
        buttonSequence.shift();
      }
      if (
        buttonSequence.length === 4 &&
        buttonSequence[0] === "down" &&
        buttonSequence[1] === "down" &&
        buttonSequence[2] === "up" &&
        buttonSequence[3] === "enter"
      ) {
        menuActive = true;
        buttonSequence = [];
      }
    }
    switch (keyCode) {
      case UP_ARROW:
        totalSlices = (totalSlices + 4) % 64;
        if (totalSlices == 0) { //jump over zero
          totalSlices = 4;
        }
        break;
      case DOWN_ARROW:
        totalSlices = (totalSlices - 4) % 64;
        if (totalSlices == 0) { //jump over zero
          totalSlices = 64;
        }
        break;
      case 83: //s for save
        saveCanvas(cnv, 'kaleidoscope', 'jpg');
        break;
    }
  }
}
