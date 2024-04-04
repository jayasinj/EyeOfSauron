// Import the libraries
const os = require('os');
const express = require('express');
const path = require('path'); // Import the path module

// Create an express application
const app = express();

// Init stuff for websockets and GPIO on r-pi
const http = require('http');
const WebSocket = require('ws');

console.log('Started server');
const server = http.createServer(app);
console.log('Started webserver');

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
console.log('Started Websocket Server');

// Define the port to run the server on
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname)));

// Define the GPIO setup logic (for Raspberry Pi)
if (os.platform() === 'linux') {
  const Gpio = require('onoff').Gpio;
  // Rest of your GPIO code...
}

// Send button presses to the client
function broadcastButtonEvent(buttonNum,value) {
      console.log(`Button ${buttonNum} pressed, val = ${value}`);
      // Broadcast button press to all connected WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          console.log('broadcasting to client');
          client.send(JSON.stringify({ buttonNum: buttonNum, buttonPressed: value }));
        }
      });
}

// Map 5 buttons
function setupGPIO() {
  if (os.platform() === 'linux') {
    console.log('Setting up 5 r-pi buttons');
    const Gpio = require('onoff').Gpio;
    const button0 = new Gpio(21, 'in', 'both', { activeLow:true}); // Use GPIO pin 21 as input
    const button1 = new Gpio(20, 'in', 'both', { activeLow:true}); // Use GPIO pin 20 as input
    const button2 = new Gpio(26, 'in', 'both', { activeLow:true}); // Use GPIO pin 26 as input
    const button3 = new Gpio(16, 'in', 'both', { activeLow:true}); // Use GPIO pin 16 as input
    const button4 = new Gpio(19, 'in', 'both', { activeLow:true}); // Use GPIO pin 19 as input

    console.log('button0');
    button0.watch((err, value) => {
      if (err) { console.error('There was an error', err); return; }
      broadcastButtonEvent(0,value);
    });

    console.log('button1');
    button1.watch((err, value) => {
      if (err) { console.error('There was an error', err); return; }
      broadcastButtonEvent(1,value);
    });

    console.log('button2');
    button2.watch((err, value) => {
      if (err) { console.error('There was an error', err); return; }
      broadcastButtonEvent(2,value);
    });

    console.log('button3');
    button3.watch((err, value) => {
      if (err) { console.error('There was an error', err); return; }
      broadcastButtonEvent(3,value);
    });

    console.log('button4');
    button4.watch((err, value) => {
      if (err) { console.error('There was an error', err); return; }
      broadcastButtonEvent(4,value);
    });

    process.on('SIGINT', _ => {
      button0.unexport();
      button1.unexport();
      button2.unexport();
      button3.unexport();
      button4.unexport();
    });
  } else {
    console.log('GPIO not supported on this platform. Skipping GPIO setup.');
  }
}

// Call GPIO setup function
setupGPIO();

// WebSocket connection handler
wss.on('connection', function connection(ws, req) {
  const clientIp = req.socket.remoteAddress;
  console.log(`Client connected via WebSocket from ${clientIp}`);

  // Handle messages received from the client
  ws.on('message', (message) => {
    console.log(`Received message from client: ${message}`);
    // Optionally, respond to specific messages
  });

  // Clean up when the WebSocket is closed
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  wss.on('error', function error(err) {
    console.error(`WebSocket server error: ${err}`);
  });
});


// Start the HTTP server on the specified port
console.log('Starting HTTP server')
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Started WebSocket Server');
});
