const fs = require('fs');
const logFilePath = './test.log'; // Adjust the path as necessary

try {
  fs.appendFileSync(logFilePath, 'Test log entry\n', 'utf8');
  console.log('Log entry was successfully written.');
} catch (err) {
  console.error('Error writing to log file:', err);
}

