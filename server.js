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

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

let buttonStates = {};

// Map 5 buttons
function setupGPIO() {
  if (os.platform() === 'linux') {
    console.log('Setting up 5 r-pi buttons');
    const Gpio = require('onoff').Gpio;
    const debounceTime = 75; // 75 ms debounce period

    const buttons = [
      new Gpio(21, 'in', 'both', { activeLow: true }),
      new Gpio(20, 'in', 'both', { activeLow: true }),
      new Gpio(26, 'in', 'both', { activeLow: true }),
      new Gpio(16, 'in', 'both', { activeLow: true }),
      new Gpio(19, 'in', 'both', { activeLow: true })
    ];

    buttons.forEach((button, index) => {
      // Initialize the state as null or a known default
      buttonStates[index] = 0;
    
      button.watch((err, value) => {
        if (err) {
          console.error('There was an error', err);
          return;
        }

        console.log(`State change detected for button ${index}, new value: ${value}`);
    
        // Check if the state has changed
        if (buttonStates[index] !== value) {
          // State has changed, update the stored state
          buttonStates[index] = value;
    
          console.log(`State change detected for button ${index}, new value: ${value}`);
          // Now, value == 0 indicates a transition to pressed (if activeLow is true)
          // and value == 1 indicates a transition to released (if activeLow is true)
          if (value === 1) {
            console.log(`Button ${index} was pressed`);
          } else {
            console.log(`Button ${index} was released`);
          }
    
          // Proceed with your broadcast or handling function
          broadcastButtonEvent(index, value);
        }
      });
    });
    

    process.on('SIGINT', _ => {
      buttons.forEach(button => { button.unexport(); });
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

// Handle HTTP server errors
server.on('error', function error(err) {
  console.error(`HTTP server error: ${err}`);
});
