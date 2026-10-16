// Controls console logging, for development purposes
// FYI -> Lines with /* */ around them were used to fix smth and im afraid I might need it again later
let logToConsole = true;

// Position-Related Variables
let isMoving = false;
let x = 0;
let y = 0;
let tempX;
let tempY;
let scale = 1; // This thing took way too long to get working and it's still buggy.
               // If you're referencing my script to make something, IGNORE THIS.

let mouseX;
let mouseY;

// Canvas Stuff
let c; // Canvas -- Defined in Start()
let ctx; // Context -- Also defined in Start()
let dpr; // According to a guide online this is important. Not sure what it does honestly
let withinRangeOf = "none";

// Accessibility Stuff
let selected = ""; // This is used in accessibility.js
let isKeyNav = false;

let isCameraLerp = false;
let newX;
let newY;
let Xdiff = 0;
let Ydiff = 0;

// Actual game related variables
// Currencies
var points = 0;

// Point gain
var pointGain;
var basePointGain = 0;
var multiPointGain = 1;
var ExpPointGain = 1;


// Runs when the page loads
// The "pageLoaded" variable is here to prevent functions running prematurely
let pageLoaded = false;
function Start() {
    // Set the canvas var to match the canvas in HTML
    c = document.getElementById("mainCanvas");

    resizeCanvas();

    // Set up the canvas "context" (used to actually draw on the canvas)
    // W3Schools saved my ass here ngl
    ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    pageLoaded = true;
    if (logToConsole) console.log("Page loaded.");
}


// Resises the canvas accurately
function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    c.width = Math.round(window.innerWidth * dpr);
    c.height = Math.round(window.innerHeight * dpr);
    c.style.width = `${window.innerWidth}px`;
    c.style.height = `${window.innerHeight}px`;
}


// Runs function every 1/60 seconds
// In other words, the canvas runs at 60fps (or at least tries to)
const intervalId = setInterval(() => {
    // Voids function if the page hasn't loaded
    if (!pageLoaded) return;

    // Draws the canvas
    drawCanvas();

    // Run camera lerp 
    if (isCameraLerp) {
        Xdiff /= 1.3;
        Ydiff /= 1.3;

        x = newX - Xdiff;
        y = newY - Ydiff;
    }
    if (Math.abs(Xdiff) < 0.01 && Math.abs(Ydiff) < 0.01) isCameraLerp = false;
    console.log(`XDiff: ${Xdiff} | YDiff: ${Ydiff}`);

    // Run currency calculations
    manageBoosts();

    let totalPointMulti = multiPointGain * upgrades[2].boost * upgrades[3].boost * upgrades[4].boost;
    pointGain = Math.pow(basePointGain * totalPointMulti, ExpPointGain);
    points += (pointGain / 60);
}, 1000/60);


// Resizes canvas when the window size changes
window.addEventListener("resize", () => {
    if (!pageLoaded) return;
    resizeCanvas();
});

// Modifies the scale variable when scrolling is detected
window.addEventListener("wheel", (event) => {
    // Adjust scale based on.. honestly idk, ask Mozilla Docs
    scale += -(event.deltaY / 1000);

    // Set scaling limits
    let lowerLim = 0.2;
    let upperLim = 3;
    if (scale > upperLim) scale = upperLim;
    if (scale < lowerLim) scale = lowerLim;
})


// Runs this function every time it detects mouse movement
document.addEventListener("mousemove", moveCam);
document.addEventListener("touchmove", moveCam);

function moveCam() {
    // Set mouse position variables based on where the mouse is on the screen
    // VSCode says "event" is depreciated but it works so idgaf
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Detects if the left mouse button is being held
    // If it is, it updates the simulated camera pos
    if (event.buttons === 1) {
        isMoving = true;
        x = tempX - mouseX;
        y = tempY - mouseY;
        if (logToConsole) console.log("Camera is moving.")
    }

    // It is unoptimised as all hell to set this here but it makes it work so.
    withinRangeOf = "none";
}


// Runs this function when it detects any mouse button inputs
// Doesn't account for releases, only if it's down or not
document.addEventListener("mousedown", inputDown);
document.addEventListener("touchstart", inputDown);

function inputDown() {
    // Reset arrow key nav if not using arrow keys
    isKeyNav = false;
    selected = "";

    // Set mouse position variables based on where the mouse is on the screen
    // These are defined differently from "mousemove" above since they never interact
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Temp coords are basically a combo of camera pos and mouse pos for pos correction
    tempX = x + mouseX;
    tempY = y + mouseY;
    /* console.log(`temp X: ${tempX} temp Y: ${tempY}`) */

    // Voids the function if the button pressed isn't the left mouse button
    if (event.buttons !== 1) return;

    // Detect if an element is being clicked using withinRangeOf
    if (logToConsole) console.log(withinRangeOf);
    if (withinRangeOf != "none") {
        buttonClick(withinRangeOf);
    }
}


// Runs this function when it detects any mouse button RELEASES
// Only used for simulated camera movement
// It may not actually be needed but I am NOT going to remove it
document.addEventListener("mouseup", inputUp);
document.addEventListener("touchend", inputUp);

function inputUp() {
    isMoving = false;
    if (logToConsole) console.log("Mouse input released.")
}


// Runs this function every time any key is pressed
document.addEventListener("keydown", (event) => {
    // Checks if the key pressed was the spacebar
    if (event.code === "Space") {
        // Resets the simulated camera position & scale
        x = 0;
        y = 0;
        scale = 1;
    }
})


// Defines all objects on the page
// This is probably unoptimised as all hell but if it works it works
// I could probably just add coords to upgrades[] and make it simpler but ... I don't wanna redo this
const movingObjs = [
    { type: "Upgrade", upgType: "U", id: "1", coords: [0, 0] },
    { type: "Upgrade", upgType: "U", id: "2", coords: [-250, 500] },
    { type: "Upgrade", upgType: "U", id: "3", coords: [250, 500] },
    { type: "Upgrade", upgType: "U", id: "4", coords: [-750, 500] },
    { type: "Upgrade", upgType: "U", id: "5", coords: [250, 1000] },
    
    // Order matters. Text is drawn last so it appears on top.
    // There's going to be non-upgrade text and boxes later... probably
]


// Detects if the mouse is hovering over a canvas item
// d = detect. dw = detect width, dh = detect height, etc.
function touchingMouse(dx, dy, dw, dh) {
    // Define the bounds of the object trying to be detected
    let left = dx - (dw / 2) - x;
    let right = dx + (dw / 2) - x;
    let top = dy + (dh / 2) + y;
    let bottom = dy - (dh / 2)  + y;
    /* console.log(`left: ${left}, right: ${right}, top: ${top}, bottom: ${bottom}`); */

    // Get the mouse pos on the screen
    let mx = (mouseX - (c.width / 2));
    let my = (-(mouseY - (c.height / 2)));
    /* console.log(`(${mx}, ${my})`); */

    // Detect if the mouse is within the object bounds
    // Note: JavaScript can't do value1 < var < value2
    if (left <= mx && right >= mx && bottom <= my && top >= my) {
        return true;
    }
    else {
        return false;
    }
}


// Runs code based on the id of the button pressed
// Praise StackOverflow for teaching me how the hell findIndex works
function buttonClick(id) {
    // Uses the upgrade ID to get the index of the upgrade in upgrades[]
    let upgNum = upgrades.findIndex(item => item.id == id);
    /* console.log(upgNum); */

    // Gets the ID and checks if it can buy the upgrade. Shouldn't need any specifications.
    let success = false;
    if (upgrades[upgNum].id == id) {
        if (points >= upgrades[upgNum].cost && upgrades[upgNum].bought < upgrades[upgNum].max) {
            success = true;
            points -= upgrades[upgNum].cost;
            upgrades[upgNum].bought++;
            if (upgrades[upgNum].costMult > 0) upgrades[upgNum].cost *= upgrades[upgNum].costMult;
        }
    }

    // Upgrade-specific boosts
    if (!success) return; // Voids the function if the upgrade purchase failed
    if (id == "U1") {
        upgrades[upgNum].cost += 10;
        basePointGain += 1;
    }
    if (id == "U2") {
        multiPointGain += 1;
    }
}