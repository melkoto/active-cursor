const robot = require('robotjs');
const readline = require('readline');

const MIN_MOUSE_MOVE_OFFSET = 50;
const MAX_MOUSE_MOVE_OFFSET = 100;

let lastMousePos = robot.getMousePos();
let lastActiveTime = Date.now();
let moveMouseTimeout = null;
let maxInactiveTime; 

/**
 * Generates a random offset for mouse movement.
 * @returns {number} Random offset for mouse movement.
 */
function getRandomOffset() {
    return Math.floor(Math.random() * (MAX_MOUSE_MOVE_OFFSET - MIN_MOUSE_MOVE_OFFSET + 1)) + MIN_MOUSE_MOVE_OFFSET;
}

/**
 * Returns the current time in HH:MM:SS format.
 * @returns {string} Current time as a string.
 */
function getCurrentTime() {
    return new Date().toLocaleTimeString();
}

/**
 * Converts milliseconds to a string format of X minutes Y seconds.
 * @param {number} milliseconds - Time in milliseconds.
 * @returns {string} Time in minutes and seconds.
 */
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0
        ? `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`
        : `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

/**
 * Moves the mouse cursor to a random position.
 */
function moveMouse() {
    const mousePos = robot.getMousePos();
    const newX = mousePos.x + (Math.random() < 0.5 ? -1 : 1) * getRandomOffset();
    const newY = mousePos.y + (Math.random() < 0.5 ? -1 : 1) * getRandomOffset();

    robot.moveMouse(newX, newY);
    console.log(`[${getCurrentTime()}] Mouse moved to: (${newX}, ${newY}). Time passed since last move: ${formatTime(Date.now() - lastActiveTime)}.`);

    lastActiveTime = Date.now();
    lastMousePos = { x: newX, y: newY };
    moveMouseTimeout = null;
}

/**
 * Sets a random timeout to move the mouse within the remaining time until the maxInactiveTime.
 */
function setMouseMoveTimeout() {
    const timeSinceLastActivity = Date.now() - lastActiveTime;
    const remainingTime = maxInactiveTime - timeSinceLastActivity;

    const randomDelay = Math.random() * remainingTime; // Random delay within the remaining time
    if (moveMouseTimeout) {
        clearTimeout(moveMouseTimeout); // Clear the previous timeout if exists
    }
    moveMouseTimeout = setTimeout(() => {
        moveMouse(); // Move the mouse when the random timer expires
    }, randomDelay);

    console.log(`[${getCurrentTime()}] Random timer set for ${formatTime(randomDelay)}, remaining time: ${formatTime(remainingTime)}.`);
}

/**
 * Checks mouse activity and ensures the mouse moves only after the user is inactive for the max time.
 */
function checkMouseActivity() {
    const currentMousePos = robot.getMousePos();
    const currentTime = Date.now();

    if (currentMousePos.x !== lastMousePos.x || currentMousePos.y !== lastMousePos.y) {
        lastActiveTime = currentTime;
        lastMousePos = currentMousePos;
        console.log(`[${getCurrentTime()}] Mouse movement detected. Timer will reset.`);
        if (moveMouseTimeout) {
            clearTimeout(moveMouseTimeout); // Reset the timer if user moves the mouse
            moveMouseTimeout = null;
        }
        setMouseMoveTimeout(); // Set a new random movement timer
    }
}

function startScript() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter maximum time without mouse movement (in minutes, minimum 1): ', (maxTimeInput) => {
        const maxTime = parseInt(maxTimeInput, 10);

        if (isNaN(maxTime) || maxTime < 1) {
            console.log('Invalid input. Maximum time must be at least 1 minute.');
            rl.close();
            return;
        }

        maxInactiveTime = maxTime * 60 * 1000;

        console.log(`Maximum inactivity time set to ${maxTime} minute(s). A random mouse movement will occur only after inactivity.`);

        setMouseMoveTimeout(); // Start the first random movement timer
        setInterval(checkMouseActivity, 1000); // Check mouse activity every second

        rl.close();
    });
}

startScript();

process.on('SIGINT', () => {
    console.log(`[${getCurrentTime()}] Script stopped. Run "npm start" to start the script again.`);
    process.exit();
});
