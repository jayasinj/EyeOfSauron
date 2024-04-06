// ButtonsMenu.js - dynamic module for connecting websocket buttons from r-pi to app

const ButtonsMenu = {
    ws: null, // Initialize WebSocket as part of the object if you need to access it from other methods
    // Define global variables for menu navigation
    menuOptions: ['Kaleidoscope', 'ToggleAspect', 'Invaders', 'Heartbeat'],
    selectedOptionIndex: 0,
    inMenu: false,


    btnConnectWebSockets: function() {
        // Implementation
        this.ws = new WebSocket('ws://localhost:3000');

        this.ws.onopen = () => {
            console.log("WebSocket connection established");
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`Button ${data.buttonNum} was pressed. Value: ${data.buttonPressed}`);
            // Additional handling...
            this.mapButtontoJSKey(data.buttonPressed, data.buttonNum);
        };

        this.ws.onerror = (error) => {
            console.log(`WebSocket error: ${error.message}`);
        };

        this.ws.onclose = (event) => {
            console.log(`WebSocket closed: Code=${event.code}, Reason=${event.reason}`);
        };
    },

    mapButtontoJSKey: function(pressed, num) {
        //let keyCode; - keyCode must be defined in the container app
	console.log(`mapButtontoJSKey ${pressed} $(num)`)
        switch(num) {
            case 0: keyCode = 13; break; // ASCII for Enter - home button
            case 1: keyCode = RIGHT_ARROW; break;
            case 2: keyCode = UP_ARROW; break;
            case 3: keyCode = DOWN_ARROW; break;
            case 4: keyCode = LEFT_ARROW; break;
            default: console.log('Invalid button number');
        }
    
        console.log(`Sending code ${keyCode}, num was ${num}`);
  
        // Implementation for handling the key press event
        // Note: keyPressed() and keyReleased() must be handled in the p5.js sketch
        // This function can trigger custom events or directly interact with the p5.js sketch if necessary
              // Send Key event
        if (pressed == true) {
            keyPressed();
        } else {
            keyReleased();
        }
        debugOut.push(`Sent.`);
    },

    ShowMenu: function() {
       if (!this.inMenu) return false;
       background(0); // Black background for menu
       fill(255); // White text color
       textSize(24); // Adjust text size as needed
   
       // Display menu options
       for (let i = 0; i < this.menuOptions.length; i++) {
           if (i === this.selectedOptionIndex) {
               // Highlight the selected option
               fill(255, 0, 0); // Red color for selected option
           } else {
               fill(255); // White color for other options
           }
           text(this.menuOptions[i], width / 2, height / 2 + i * 30); // Adjust position as needed
       }
       return true;
   }, 

   menuKeyPressed: function(keyCode)
   {
    console.log('menuKeyPressed checking..')
    if (this.inMenu) {
        // Handle menu navigation
        console.log(keyCode);
        if (keyCode === UP_ARROW) {
            this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
        } else if (keyCode === DOWN_ARROW) {
            this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.menuOptions.length;
        } else if (keyCode === ENTER) {
            // Execute selected menu option
            this.executeMenuOption(this.menuOptions[this.selectedOptionIndex]);
            this.inMenu = false; // Exit the menu after selecting an option
        }
        return true;
    } else if (keyCode === ENTER) {
            this.inMenu = true;
            console.log('Enter Menu Mode');
            return true;
        }
    return false;
    },
        
   executeMenuOption: function(option) { // return true if we handle it.
    if (!this.inMenu) { return false; }
    console.log('executeMenuOption handling key');
    switch (option) {
        case 'Kaleidoscope':
            // Code to start the kaleidoscope sketch
            this.inMenu = false; // Exit the menu
            window.location.assign('./Launch.html');
            return true;
        
            case 'ToggleAspect':
              // Change aspect ratio
              if (aspect_ratio === 1.1) {
                  aspect_ratio = 1.6;
              } else {
                  aspect_ratio = 1.1;
              }
              debugOut.push(`Aspect ratio changed to: ${aspect_ratio}`);
              this.inMenu = false; // Exit the menu
              return true;

            case 'Invaders': // Nav to the Space Invaders deck as defined in Invaders.html
               window.location.assign('./Invaders.html');
               this.inMenu = false; // Exit the menu
               return true;

            case 'HeartBeat': // Nav to the Space Invaders deck as defined in Invaders.html
              window.location.assign('./Heartbeat.html');
              this.inMenu = false; // Exit the menu
              return true;
  
        default:
            // Handle unknown options
            console.log("Unknown option selected");
            return false;
    }
  }
};

export default ButtonsMenu;
