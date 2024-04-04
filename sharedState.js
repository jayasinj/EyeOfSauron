// Shared variables

let beatDetected = false;
let peak = 0.0;

console.log('Shared State:');

export function getPeak() {
   return peak;
}

export function setPeak(value) {
 peak = value;
}

export function isBeatDetected() {
    return beatDetected;
}

export function setBeatDetect(value)
{
    beatDetected = value;
}

console.log('End shared state');