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
 let cHeight = 900;
 let capture;
 let vid;
 let offsetAngle = 0;
 let offsetAngleSpeed = 1.0; // Initial rotation speed
 let selectionmask;
 let w,h;
 let aspect_ratio = 1.6; // Stretch factor when projecting at 40 degrees

 
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
   console.log("setup")
     cnv = createCanvas(cWidth, cHeight, WEBGL);
     capture = createCapture(VIDEO);
     capture.hide();
     //fullscreen(true);
     background(0);
     let fsButton = createButton('Toggle Fullscreen');
     fsButton.mousePressed(toggleFullscreen);
     //simulateClick()
     w = int(cWidth / 2.1); //3.2
     h = int(cHeight / 2.1); //3.2
     selection_mask = createGraphics(w, h, WEBGL); //creates an off screen renderer
 }
 
 function toggleFullscreen() {
   let fs = fullscreen();
   fullscreen(!fs);
 }
 
 function draw() {
     console.log(capture.loadedmetadata)
     if (capture.loadedmetadata == true) {
         //make sure the cursor is on the sketch
         //if (mouseX >= 0 && mouseX <= cWidth && mouseY >= 0 && mouseY <= cHeight) { //mouse is over sketch
             background(0);
             //the width and height parameters for the mask
             //create a mask of a slice of the original image.
             selection_mask.noStroke();
             selection_mask.beginShape();
            // selection_mask.smooth();  //causes graphics error in open processing
             selection_mask.arc(0, 0, 2 * w, 2 * h, 0, radians(370 / totalSlices + .1)); //adding a little extra to hide edges
             var wRatio = float(cWidth - w) / float(width);
             var hRatio = float(cHeight - h) / float(height);
             var slice = createImage(w, h);
             slice = capture.get(int((offsetAngle/2) * wRatio), int((offsetAngle/2) * hRatio), w, h);
             slice.mask(selection_mask);
             //translate(width / 8, height / 4);
             var scaleAmt = 1.15; // overall size
             scale(scaleAmt);
             //apply slice in a circle
             scale(aspect_ratio, 1.0);  // Increase to stretch more horizontally
             rotate(radians(offsetAngle));
             for (k = 0; k <= totalSlices; k++) {
                 rotate(k * radians(360 / (totalSlices / 2)));
                 image(slice, 0, 0);
                 scale(-1.0, 1.0);
                 image(slice, 0, 0);
                 scale(-1.0, 1.0);
             }
 
             offsetAngle = (offsetAngle + offsetAngleSpeed) % 720;

             resetMatrix();
             selection_mask.clear();
         //}
     }
 }
 // Key functions change the number of slices and save the image
 function keyPressed() {
     //   console.log(keyCode)
     switch (keyCode) {
         case 38: //up arrow
             totalSlices = (totalSlices + 4) % 64;
             if (totalSlices == 0) { //jump over zero
                 totalSlices = 4;
             }
             //  console.log(totalSlices)
             break;
         case 40: //down arrow
             totalSlices = (totalSlices - 4) % 64;
             if (totalSlices == 0) { //jump over zero
                 totalSlices = 64;
             }
             //    console.log(totalSlices)
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
	 case 65: // A for changing aspect ratio
	     if (aspect_ratio == 1.1) { 
		aspect_ratio = 1.6 
	     } else {
                aspect_ratio = 1.1
	     }     
     }
 }
 
 
