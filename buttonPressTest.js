const Gpio = require('onoff').Gpio;
const button = new Gpio(21, 'in', 'both'); // Use GPIO pin 21 as input, and 'both' edge detection.

button.watch((err, value) => { //Watch for hardware interrupts on GPIO 4.
  if (err) {
    console.error('There was an error', err);
    return;
  }
  console.log('Button pressed!', value);
});

process.on('SIGINT', _ => {
  button.unexport();
});

