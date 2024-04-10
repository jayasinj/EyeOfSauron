let mic;
let fft;
let peakDetect;

function setup() {
  createCanvas(400, 400);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  peakDetect = new p5.PeakDetect();

  peakDetect.onPeak(beatDetected); // Call beatDetected function when a peak is detected
}

function draw() {
  background(220);

  // Get microphone input and analyze frequency spectrum
  let spectrum = fft.analyze(mic);

  // Perform peak detection
  peakDetect.update(fft);

  // Display the spectrum if needed
  // drawSpectrum(spectrum);
}

// Function to handle beat detection
function beatDetected() {
  // Beat detected! Do something...
  console.log('Beat detected!');
}

// Optional: Function to draw frequency spectrum
function drawSpectrum(spectrum) {
  for (let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width / spectrum.length, h);
  }
}
