// ButtonsMenu.js - dynamic module for connecting websocket buttons from r-pi to app

const ButtonsMenu = {
    ws: null, // Initialize WebSocket as part of the object if you need to access it from other methods
    // Define global variables for menu navigation
    menuOptions: ['Kaleidoscope', 'Invaders', 'Heartbeat'],
    hiddenMenuOptions: ['ToggleAspect','Debug','ShowStats','ReturnHome'],
    currentMenu: null,
    selectedOptionIndex: 0,
    hiddenModeCount: 0, // Used to create a backdoor sequence to display the hidden menu, current <<>>ENTER, any other cancels
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
       for (let i = 0; i < this.currentMenu.length; i++) {
           if (i === this.selectedOptionIndex) {
               // Highlight the selected option
               fill(255, 0, 0); // Red color for selected option
           } else {
               fill(255); // White color for other options
           }
           text(this.currentMenu[i], width / 2, height / 2 + i * 30); // Adjust position as needed
       }
       return true;
   }, 

   menuKeyPressed: function(keyCode)
   {
    console.log('menuKeyPressed checking..')
    if (this.hiddenModeCount>0) console.log(`hidden mode seq: ${this.hiddenModeCount}`);
    if (this.inMenu) {
        // Handle menu navigation
        console.log(`keycode: ${keyCode}`);
        if (keyCode === UP_ARROW) {
            this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.currentMenu.length) % this.currentMenu.length;
        } else if (keyCode === DOWN_ARROW) {
            this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.currentMenu.length;
        } else if (keyCode === LEFT_ARROW) {
            if (this.hiddenModeCount<=2) { this.hiddenModeCount++; console.log(this.hiddenModeCount); return true; }
            else { this.hiddenModeCount = 0; return true; }
        } else if (keyCode === RIGHT_ARROW) {
            if (this.hiddenModeCount>=2 && this.hiddenModeCount<=3) { this.hiddenModeCount++; console.log(this.hiddenModeCount); return true; }
            else { this.hiddenModeCount = 0; return true; }
        } else if (keyCode === ENTER) { // User has selected an option
            if (this.hiddenModeCount === 4) { // Seq for hidden mode has been entered
                this.currentMenu = this.hiddenMenuOptions;
                this.selectedOptionIndex = 0;
                console.log('showing hidden menu')
                this.ShowMenu();
                this.hiddenModeCount = 99; // In hidden menu
                return true;
            } 
            this.hiddenModeCount = 0;
            // Execute selected menu option (or enter hidden mode
            this.executeMenuOption(this.currentMenu[this.selectedOptionIndex]);
            this.inMenu = false; // Exit the menu after selecting an option
        }
        return true;
    } else if (keyCode === ENTER) { // Check for initial Enter key to popup menu
            this.inMenu = true;
            this.currentMenu = this.menuOptions; // Start off with MenuOptions
            console.log('Enter Menu Mode');
            return true;
    }
    return false;
    },

    getCookieValue: function(cookieName) {
        let name = cookieName + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },

    setCookieValue: function(name, value, expiresInDays = 999, path = "/") {
        const d = new Date();
        d.setTime(d.getTime() + (expiresInDays * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
        const expires = "expires=" + d.toUTCString();
        document.cookie = `${name}=${value}; ${expires}; path=${path}`;
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
            
            case 'ToggleAspect': // available from hidden menu
              // Change aspect ratio
              if (aspect_ratio === 1.1) {
                  aspect_ratio = aspect_stretch;
                  this.setCookieValue("AspectStretch", "1");
              } else {
                  aspect_ratio = aspect_normal;
                  this.setCookieValue("AspectStretch", "0");
              }

              debugOut.push(`Aspect ratio changed to: ${aspect_ratio}`);
              this.inMenu = false; // Exit the menu
              return true;

            case 'Invaders': // Nav to the Space Invaders deck as defined in Invaders.html
               window.location.assign('./Invaders.html');
               this.inMenu = false; // Exit the menu
               return true;

            case 'Heartbeat': // Nav to the Space Invaders deck as defined in Invaders.html
              window.location.assign('./Heartbeat.html');
              this.inMenu = false; // Exit the menu
              return true;

            case 'ReturnHome': // Escape the hidden Menu
              this.currentMenu = this.menuOptions;
              this.selectedOptionIndex = 0;
              this.hiddenModeCount = 0;
              this.ShowMenu();

            case 'Debug': // Toggle Debug
                debugOn = !debugOn;
                if (debugOn) this.setCookieValue("Debug", "1");
                else this.setCookieValue("Debug", "0");
        default:
            // Handle unknown options
            console.log("Unknown option selected");
            return false;
    }
  }
};

export default ButtonsMenu;
