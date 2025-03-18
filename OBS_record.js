const OBSWebSocket = require('obs-websocket-js').default;
const obs = new OBSWebSocket();
const readline = require('readline');

// OBS WebSocket connection details
const host = 'localhost';
const port = 4455; // Match the port in OBS WebSocket settings
const password = 'Nakatawe123'; // Match the password in OBS WebSocket settings

// Create an interface for reading user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt the user for start and end times
function promptForTimes() {
    rl.question('Enter the start time (HH:MM, 24-hour format): ', (startTime) => {
        rl.question('Enter the end time (HH:MM, 24-hour format): ', (endTime) => {
            rl.close(); // Close the readline interface
            connectToOBS(startTime, endTime); // Connect to OBS and start the scheduler
        });
    });
}

// Connect to OBS and start the scheduler
function connectToOBS(startTime, endTime) {
    obs.connect(`ws://${host}:${port}`, password)
        .then(() => {
            console.log('Connected to OBS WebSocket server.');
            scheduleRecording(startTime, endTime);
        })
        .catch(err => {
            console.error('Failed to connect to OBS WebSocket:', err);
        });
}

// Schedule recording
function scheduleRecording(startTime, endTime) {
    const checkTime = () => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // Get current time in HH:MM format

        if (currentTime === startTime) {
            startRecording();
        } else if (currentTime === endTime) {
            stopRecording();
            clearInterval(interval); // Stop checking the time
        }
    };

    const interval = setInterval(checkTime, 5000); // Check every 30 seconds
    console.log('Scheduler started. Waiting for the recording time...');
}

// Start recording
function startRecording() {
    obs.call('StartRecord')
        .then(() => {
            console.log('Recording started successfully.');
        })
        .catch(err => {
            console.error('Failed to start recording:', err);
        });
}

// Stop recording
function stopRecording() {
    obs.call('StopRecord')
        .then(() => {
            console.log('Recording stopped successfully.');
            process.exit(0); // Exit the script
        })
        .catch(err => {
            console.error('Failed to stop recording:', err);
        });
}

// Handle errors
obs.on('error', err => {
    console.error('OBS WebSocket error:', err);
});

// Start the script by prompting for times
promptForTimes();