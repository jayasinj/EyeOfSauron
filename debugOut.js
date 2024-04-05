
export const debugLines = 5;

export class DebugStringQueue {
    constructor(logFilePath) {
      this.queue = [];
      this.capacity = debugLines; // Maximum number of strings in the queue
      this.logFilePath = logFilePath; // Path to the logfile
      this.pusheditems = 0;
    }
  
    // Method to add a new string to the queue
    push(newString) {
      // Check if the queue has reached its capacity
      if (this.queue.length > this.capacity) {
          // Remove the oldest string (first element)
          this.queue.shift();
      }
      // Increment the count of pushed items
      this.pusheditems++;
      // Add the new string to the end of the queue, prefixed with its push order
      this.queue.push(`${this.pusheditems}) ${newString}`);
      console.log(newString);
  
      // Append the new string to the logfile
      // this.appendStringToLogFile(newString);
    }
  
    // Method to get the current state of the queue
    getQueue() {
      return this.queue;
    }
  
    getCount() {
      return this.queue.length;
    }
    
    appendStringToLogFile(string) {
      // Ensure the string ends with a newline for readability in the log file
     console.log(string);
    }
  
    // Method to access a string by its ordinal (index)
    getByIndex(index) {
      if (index >= 0 && index < this.queue.length) {
        return this.queue[index];
      }
      return null; // Return null if the index is out of bounds
    }
  }
  
  export const debugOut = new DebugStringQueue('./sauronDebug'); // Sadly can't create files in static js :(


  