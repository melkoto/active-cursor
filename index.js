const robot = require('robotjs');
const readline = require('readline');

const MIN_MOUSE_MOVE_OFFSET = 50;
const MAX_MOUSE_MOVE_OFFSET = 100;

let lastMousePos = robot.getMousePos();
let lastActiveTime = Date.now();
let moveMouseTimeout;

/**
 * Generates a random mouse movement offset.
 * @returns {number} The random offset for mouse movement.
 */
function getRandomOffset() {
    return Math.floor(Math.random() * (MAX_MOUSE_MOVE_OFFSET - MIN_MOUSE_MOVE_OFFSET + 1)) + MIN_MOUSE_MOVE_OFFSET;
}

/**
 * Gets the current time formatted as HH:MM:SS.
 * @returns {string} The current time as a string.
 */
function getCurrentTime() {
    return new Date().toLocaleTimeString();
}

/**
 * Converts milliseconds to a string formatted as X minutes Y seconds.
 * @param {number} milliseconds - The time in milliseconds.
 * @returns {string} The time formatted as minutes and seconds.
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
 * Moves the mouse cursor.
 */
function moveMouse() {
    const mousePos = robot.getMousePos();
    const newX = mousePos.x + (Math.random() < 0.5 ? -1 : 1) * getRandomOffset();
    const newY = mousePos.y + (Math.random() < 0.5 ? -1 : 1) * getRandomOffset();

    robot.moveMouse(newX, newY);
    console.log(`[${getCurrentTime()}] Mouse moved to: (${newX}, ${newY}). Time passed since last move: ${formatTime(Date.now() - lastActiveTime)}.`);

    lastActiveTime = Date.now();
}

/**
 * Checks mouse activity and moves the cursor if no activity is detected within the maximum time limit.
 * @param {number} maxInactiveTime - The maximum inactive time (in milliseconds).
 */
function checkMouseActivity(maxInactiveTime) {
    const currentMousePos = robot.getMousePos();
    const currentTime = Date.now();

    if (currentMousePos.x !== lastMousePos.x || currentMousePos.y !== lastMousePos.y) {
        lastActiveTime = currentTime;
        lastMousePos = currentMousePos;
        console.log(`[${getCurrentTime()}] Mouse movement detected. Timer reset.`);
        clearTimeout(moveMouseTimeout); 
    }

    if (currentTime - lastActiveTime >= maxInactiveTime) {
        console.log(`[${getCurrentTime()}] Mouse inactive for ${formatTime(currentTime - lastActiveTime)}. Performing action...`);
        moveMouse();
    } else {
        const timeLeft = maxInactiveTime - (currentTime - lastActiveTime);
        clearTimeout(moveMouseTimeout); 
        moveMouseTimeout = setTimeout(moveMouse, Math.random() * timeLeft);
    }
}

/**
 * Reads the interval and max time from the terminal, validates input, and starts the script.
 */
function startScript() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the interval for checking mouse activity (in minutes, minimum 1): ', (intervalInput) => {
        const interval = parseInt(intervalInput, 10);

        if (isNaN(interval) || interval < 1) {
            console.log('Invalid input. Interval must be at least 1 minute.');
            rl.close();
            return;
        }

        rl.question('Enter the maximum time before moving the mouse (in minutes, minimum 2): ', (maxTimeInput) => {
            const maxTime = parseInt(maxTimeInput, 10);

            if (isNaN(maxTime) || maxTime < interval + 1) {
                console.log(`Invalid input. Maximum time must be at least ${interval + 1} minutes.`);
                rl.close();
                return;
            }

            const maxInactiveTime = (maxTime - interval) * 60 * 1000;

            console.log(`Max inactive time set to ${maxTime - interval} minutes. Checking every ${interval} minute(s).`);

            setInterval(() => checkMouseActivity(maxInactiveTime), interval * 60 * 1000);

            rl.close();
        });
    });
}

startScript();

process.on('SIGINT', () => {
    console.log(`[${getCurrentTime()}] Script stopped. Run "npm start" to start script again`);
    process.exit();
});
