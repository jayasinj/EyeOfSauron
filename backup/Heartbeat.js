// gifPlayer.js
let gif;
let lastBeatTime = 0;
let fft;
let peakDetect;
let mic;

function setup() {
    gif = document.getElementById('gif');
    fft = new p5.FFT();
    peakDetect = new p5.PeakDetect(); // Create a PeakDetect object

    // Create an AudioIn object for the microphone
    mic = new p5.AudioIn();
    mic.start();

    // Set the microphone as the input for FFT analysis
    fft.setInput(mic);
}

function playGif() {
    let currentTime = millis();
    peakDetect.update(fft); // Update peakDetect with FFT analysis
    if (peakDetect.isDetected && currentTime - lastBeatTime > 0) { // Check if a peak (beat) is detected
        let timeBetweenBeats = currentTime - lastBeatTime;
        let gifDuration = gif.duration * 1000; // duration in milliseconds
        let speed = gifDuration / timeBetweenBeats;
        gif.playbackRate = speed;
        lastBeatTime = currentTime;
    }
    requestAnimationFrame(playGif);
}

document.addEventListener("DOMContentLoaded", function() {
    setup();
    playGif();
});
