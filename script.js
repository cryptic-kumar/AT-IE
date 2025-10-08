document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const elevatorCar = document.getElementById('elevator-car');
    const floorButtons = document.querySelectorAll('.floor-btn');
    const logDisplay = document.getElementById('log-display');
    const stateNodes = {
        idle: document.getElementById('state-idle'),
        movingUp: document.getElementById('state-moving-up'),
        movingDown: document.getElementById('state-moving-down'),
        doorOpen: document.getElementById('state-door-open'),
    };

    // --- Constants ---
    const FLOOR_HEIGHT = 120; // Corresponds to --floor-height in CSS
    const TIME_PER_FLOOR = 2000; // 2 seconds per floor
    const DOOR_OPEN_TIME = 3000; // 3 seconds for doors to stay open

    // --- Finite Automata (FA) State ---
    const STATES = {
        IDLE: 'idle',
        MOVING_UP: 'moving-up',
        MOVING_DOWN: 'moving-down',
        DOOR_OPEN: 'door-open'
    };
    let currentState = STATES.IDLE;
    let currentFloor = 0;
    let requestQueue = []; // A queue to hold floor requests

    // --- Helper Functions ---

    /**
     * Logs a message to the log panel and console.
     * @param {string} message - The message to log.
     */
    function logMessage(message) {
        console.log(message);
        const p = document.createElement('p');
        p.textContent = message;
        logDisplay.prepend(p); // Add new message to the top
    }

    /**
     * Updates the FA state diagram to highlight the current state.
     * @param {string} newState - The state to activate (e.g., 'idle').
     */
    function updateStateUI(newState) {
        // Remove 'active' class from all state nodes
        Object.values(stateNodes).forEach(node => node.classList.remove('active'));
        
        // Add 'active' class to the new state node
        if (stateNodes[newState]) {
            stateNodes[newState].classList.add('active');
        }
    }
    
    /**
     * Sets the new state for the elevator FA.
     * @param {string} newState - The state from the STATES object.
     */
    function setState(newState) {
        currentState = newState;
        let stateKey;
        // Map FA state to the keys used in stateNodes object
        switch (newState) {
            case STATES.IDLE:         stateKey = 'idle'; break;
            case STATES.MOVING_UP:    stateKey = 'movingUp'; break;
            case STATES.MOVING_DOWN:  stateKey = 'movingDown'; break;
            case STATES.DOOR_OPEN:    stateKey = 'doorOpen'; break;
        }
        updateStateUI(stateKey);
    }
    
    // --- Core Elevator Logic ---

    /**
     * Processes the next request in the queue if the elevator is idle.
     */
    function processNextRequest() {
        if (currentState !== STATES.IDLE || requestQueue.length === 0) {
            return; // Do nothing if busy or no requests
        }

        const targetFloor = requestQueue.shift(); // Get the next request

        if (targetFloor === currentFloor) {
            logMessage(`Already at Floor ${targetFloor}. Opening doors.`);
            openDoors();
        } else {
            moveElevator(targetFloor);
        }
    }

    /**
     * Moves the elevator to the target floor.
     * @param {number} targetFloor - The destination floor number.
     */
    function moveElevator(targetFloor) {
        const direction = targetFloor > currentFloor ? 'UP' : 'DOWN';
        setState(direction === 'UP' ? STATES.MOVING_UP : STATES.MOVING_DOWN);
        logMessage(`Moving ${direction} to Floor ${targetFloor}...`);
        
        const travelDistance = Math.abs(targetFloor - currentFloor);
        const travelTime = travelDistance * TIME_PER_FLOOR;

        // Animate elevator movement using CSS transition
        elevatorCar.style.transition = `bottom ${travelTime / 1000}s ease-in-out`;
        elevatorCar.style.bottom = `${targetFloor * FLOOR_HEIGHT}px`;

        // After the movement animation completes...
        setTimeout(() => {
            currentFloor = targetFloor;
            logMessage(`Arrived at Floor ${currentFloor}.`);
            openDoors();
        }, travelTime);
    }

    /**
     * Simulates opening the elevator doors.
     */
    function openDoors() {
        setState(STATES.DOOR_OPEN);
        logMessage('Doors are opening.');
        elevatorCar.querySelector('.left-door').classList.add('open');
        elevatorCar.querySelector('.right-door').classList.add('open');

        // Wait for doors to be open, then start closing them
        setTimeout(closeDoors, DOOR_OPEN_TIME);
    }

    /**
     * Simulates closing the elevator doors.
     */
    function closeDoors() {
        logMessage('Doors are closing.');
        elevatorCar.querySelector('.left-door').classList.remove('open');
        elevatorCar.querySelector('.right-door').classList.remove('open');

        // After doors are closed, return to idle and check for more requests
        setTimeout(() => {
            setState(STATES.IDLE);
            logMessage('Elevator is idle. Waiting for requests.');
            processNextRequest(); // Check if there are more floors to visit
        }, 500); // 500ms for door closing animation
    }

    // --- Event Listeners ---

    floorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const floor = parseInt(button.dataset.floor, 10);
            
            // Add request to queue if not already present
            if (!requestQueue.includes(floor)) {
                requestQueue.push(floor);
                // A simple sorting logic: process floors in the current direction first
                requestQueue.sort((a, b) => {
                    const dir = currentState === STATES.MOVING_UP ? 1 : -1;
                    if ( (a > currentFloor && b > currentFloor) || (a < currentFloor && b < currentFloor) ) {
                        return dir * (a - b);
                    }
                    return a - b;
                });

                logMessage(`Request for Floor ${floor} added to queue.`);
            }
            
            // Start processing if the elevator is idle
            if (currentState === STATES.IDLE) {
                processNextRequest();
            }
        });
    });

    // --- Initialization ---
    logMessage('Elevator is idle at Ground Floor.');
    setState(STATES.IDLE);
});
      
