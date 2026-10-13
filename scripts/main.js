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

// Actual game related variables
// Currencies
var points = 10000;

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
document.addEventListener("mousemove", (event) => {
    // Set mouse position variables based on where the mouse is on the screen
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
})


// Runs this function when it detects any mouse button inputs
// Doesn't account for releases, only if it's down or not
document.addEventListener("mousedown", (event) => {
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
})


// Runs this function when it detects any mouse button RELEASES
// Only used for simulated camera movement
// It may not actually be needed but I am NOT going to remove it
document.addEventListener("mouseup", () => {
    isMoving = false;
    if (logToConsole) console.log("Mouse input released.")
})


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


// Makes all the elements on the page
// Becuase it's all on a canvas, it does the same loop every frame:
// Erase the visible canvas -> Draw every item
function drawCanvas() {
    // Define position vars
    let localX;
    let localY;

    // Resets the canvas
    ctx.clearRect(0, 0, c.width, c.height);

    // First thing to be drawn is the background
    // Draw the vertical lines
    ctx.strokeStyle = "rgb(6, 6, 6)";
    ctx.lineWidth = 5 * scale;
    let gapSize = 100 * scale;
    let lineX = -(x % gapSize);
    while (lineX < c.width) {
        ctx.beginPath();
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, c.height);
        ctx.stroke();
        lineX += gapSize;
    }
    // Now draw the horizontal lines
    let lineY = -(y % gapSize);
    while (lineY < c.height) {
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(c.width, lineY);
        ctx.stroke();
        lineY += gapSize;
    }

    // Draws every object in movingObjs[] based on simulated camera location
    for (let i = 0; i < movingObjs.length; i++) {
        // Gets the coords of the object
        localX = movingObjs[i].coords[0];
        localY = -(movingObjs[i].coords[1]); //Negative because canvas defaults to downward y-scaling. Fuck you Brendan Eich.

        // Stylizes anything to be drawn. Mostly text specifications
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draws all boxes
        if (movingObjs[i].type == "Box") {
            // Define key points for the box
            let obj = movingObjs[i];
            let w = obj.size[0];
            let h = obj.size[1];
            let x1 = localX - (w / 2);
            let y1 = localY - (h / 2);

            // Define box styles
            ctx.strokeStyle = obj.border;
            ctx.fillStyle = obj.bg;
            ctx.lineWidth = 3;

            // Draw the box (outline & fill must be done separately)
            ctx.strokeRect(-(x - x1) + (c.width / 2), -(y - y1) + (c.height / 2), w, h);
            ctx.fillRect(-(x - x1) + (c.width / 2), -(y - y1) + (c.height / 2), w, h);
        }

        // Draws all text
        if (movingObjs[i].type == "Text") {
            // Set text styles
            ctx.font = `${movingObjs[i].size[0]}px Roboto`;
            ctx.fillStyle = movingObjs[i].color;
            
            // Set text content
            let text = movingObjs[i].content;
            if (text == "clicks") {
                text = `${clicks} Clicks`;
            }
            if (text == "bool") {
                text = toggled;
            }

            // Draws the text aligned to the canvas, adjusted to (0, 0) based on canvas size
            ctx.fillText(text, -(x - localX) + (c.width / 2), -(y - localY) + (c.height / 2));
        }

        // Draws all upgrades
        if (movingObjs[i].type == "Upgrade") {
            // First: Detect if the upgrade has even been unlocked
            let fullID = movingObjs[i].upgType + movingObjs[i].id;
            let upgNum = upgrades.findIndex(item => item.id == fullID);
            let reqs = upgrades[upgNum].req.length;
            let unlocked = 0;
            if (logToConsole) console.log(`fullID: ${fullID} | upgNum: ${upgNum} | reqs: ${reqs} | unlocked: ${unlocked}`);
            for (let j = 0; j < reqs; j++) {
                // Case 1: No requirement
                if (upgrades[upgNum].req[j] == "") {
                    unlocked += 1;
                    break;
                }

                // Case 2: Normal upgrade requirement
                let numToCheck = upgrades.findIndex(item => item.id == upgrades[upgNum].req[j]);
                if (logToConsole) console.log(`req: ${upgrades[upgNum].req[j]} | numToCheck: ${numToCheck}`);
                if (upgrades[numToCheck].bought > 0) {
                    unlocked += 1;
                }
            }
            // Stops the function if the upgrade hasn't been unlocked
            if (unlocked != reqs) continue;

            // Set defining upgrade parts
            let id = movingObjs[i].id;
            // Set width & height (more organised ig)
            let width = 400;
            let height = 400;

            // This moves the coords from the center of the box to the corner so that the box is centered at its coords
            // This is done because boxes are drawn with their top-left corner pos and width/height
            x1 = localX - (width / 2);
            y1 = localY - (height / 2);

            // Set box style
            ctx.strokeStyle = "rgb(100, 100, 100)";
            ctx.fillStyle = "rgba(100, 100, 100, 0.2)";
            ctx.lineWidth = 3 * scale;

            // Parameter: Change border style if touching mouse
            if (touchingMouse(localX * scale, -localY * scale, width * scale, height * scale)) {
                withinRangeOf = movingObjs[i].upgType + movingObjs[i].id;
                ctx.strokeStyle = "rgb(255, 255, 255)";
            }

            // Draw the box
            ctx.strokeRect((-(x - x1 * scale) + (c.width / 2)), (-(y - y1 * scale) + (c.height / 2)) , width * scale, height * scale);
            ctx.fillRect((-(x - x1 * scale) + (c.width / 2)), (-(y - y1 * scale) + (c.height / 2)), width * scale, height * scale);

            // Now, the different texts for an upgrade are drawn
            // Set the text style for the upgrade
            ctx.fillStyle = "white";
            let fontSize = 30 * scale;
            ctx.font = `${fontSize}px Roboto`;

            ctx.textAlign = "right";
            // ID Text
            ctx.fillText(`#${id}`, -(x - (190 * scale) - localX * scale) + (c.width / 2), -(y + (170 * scale) - localY * scale) + (c.height / 2));
            // Cost Text
            let costString = (upgrades[upgNum].bought < upgrades[upgNum].max) ? `${formatNumber(upgrades[upgNum].cost, 2)} Points` : "MAXED";
            ctx.fillText(`${costString}`, -(x - (190 * scale) - localX * scale) + (c.width / 2), -(y - (180 * scale) - localY * scale) + (c.height / 2));

            ctx.textAlign = "left";
            // Title Text
            ctx.fillText(`${upgrades[upgNum].title}`, -(x + (190 * scale) - localX * scale) + (c.width / 2), -(y + (170 * scale) - localY * scale) + (c.height / 2));
            // Amt Bought Text
            ctx.fillStyle = (upgrades[upgNum].bought == upgrades[upgNum].max) ? "rgb(50, 50, 255)" : `hsl(${(upgrades[upgNum].bought / upgrades[upgNum].max) * 80}, 100%, 50%)`;
            ctx.fillText(`${upgrades[upgNum].bought}/${upgrades[upgNum].max}`, -(x + (190 * scale) - localX * scale) + (c.width / 2), -(y - (180 * scale)  - localY * scale) + (c.height / 2));
            ctx.fillStyle = "white";

            ctx.textAlign = "center";
            // Description Text
            let descString;
            if (upgrades[upgNum].boost != -999) {
                descString = `${upgrades[upgNum].desc} (Currently: x${formatNumber(upgrades[upgNum].boost, 2)})`;
                console.log(`Orig: ${upgrades[upgNum].desc.length} | New: ${descString.length}`);
            }
            else {
                descString = `${upgrades[upgNum].desc}`;
            }

            // Multi-line descriptions may exist. This is my half-assed attempt to make it work
            // #region multi-line
            const maxLineLength = 25;
            let lineHeight = 40 * scale; // I'm totally just guessing what this is supposed to be

            let lines = 0;
            let charsCounted = 0;

            let stringMin;
            let stringMax;
            let lastStringEnd = -1; // -1 because the first character in a string is index 0. I SWEAR it makes sense
            while (charsCounted < descString.length) {
                // Detect string start/end for each line
                stringMin = lastStringEnd + 1;
                stringMax = stringMin + maxLineLength;

                // Checks if the last character within the string portion isn't a space and does exist
                // If it returns true, it shortens the string to the nearest space
                if (descString.charAt(stringMax) != " " && descString.charAt(stringMax) != "") {
                    while (descString.charAt(stringMax) != " ") {
                        stringMax -= 1;
                    }
                }
                // Does something similar for the first string, but different so it doesn't repeat words
                if (descString.charAt(stringMin) != " " && stringMin > 0 && descString.charAt(stringMax) != "") {
                    while (descString.charAt(stringMin) != " ") {
                        if (stringMin > 0) stringMin -= 1;
                    }
                }

                lines++;
                charsCounted += stringMax - stringMin;
            }
            let offset = (lineHeight / 2) * (lines - 1);

            // Resets the variable from counting the line amt
            lastStringEnd = -1; // -1 because the first character in a string is index 0. I SWEAR it makes sense

            for (let i = 0; i < lines; i++) {
                // Yes, the code below is the exact same as above.. mostly
                // I know this is redundunt as all hell, but it's functional.
                // I barely know how the hell this works. But it does.

                // Detect string start/end for each line
                stringMin = lastStringEnd + 1;
                stringMax = stringMin + maxLineLength;

                // Breaks the loop if stringMin is greater than the string length, for some reason
                if (stringMin > descString.length) break;

                // Checks if the last character within the string portion isn't a space and does exist
                // If it returns true, it shortens the string to the nearest space
                if (descString.charAt(stringMax) != " " && descString.charAt(stringMax) != "") {
                    while (descString.charAt(stringMax) != " ") {
                        stringMax -= 1;
                    }
                }
                // Does something similar for the first string, but different so it doesn't repeat words
                if (descString.charAt(stringMin) != " " && stringMin > 0 && descString.charAt(stringMax) != "") {
                    while (descString.charAt(stringMin) != " ") {
                        if (stringMin > 0) stringMin -= 1;
                    }
                }

                // Set the string and write it
                let stringSnippet = descString.substring(stringMin, stringMax);
                if (stringSnippet != " ") ctx.fillText(`${stringSnippet}`, -(x - localX * scale) + (c.width / 2), -((y - localY * scale) + offset - (lineHeight * i)) + (c.height / 2));

                // Setup for next loop (if necessary)
                lastStringEnd = stringMax;
                console.log(`Loop ${i} | min: ${stringMin}, max: ${stringMax}`)
            }
            // #endregion
        }
    }

    // Draws the camera pos display (defined here cuz why not)
    let posString = `X: ${x}, Y: ${-y}`;
    let warnString = (x > 5000 || x < -5000 || y > 5000 || y < -5000) ? " -- Press Space to Reset Camera" : "";
    ctx.font = "16px Roboto";
    ctx.fillStyle = "grey";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(`${posString} ${warnString}`, 10, 10);

    // Draws the mouse pos display
    let mouseString = `Mouse X: ${Math.round(mouseX - (c.width / 2))}, Mouse Y: ${Math.round(-(mouseY - (c.height / 2)))}`;
    ctx.textAlign = "right";
    ctx.fillText(`${mouseString}`, c.width - 10, 10);

    // TEMPORARY mouse-hovering display
    let tempString = `Hovering: ${withinRangeOf}`;
    ctx.textAlign = "right";
    ctx.fillText(`${tempString}`, c.width - 10, 30);

    // Draws the zoom display
    let zoomString = `Zoom: x${formatNumber(scale, 2)}`;
    ctx.textAlign = "left";
    ctx.fillText(`${zoomString}`, 10, 30);

    // Draws the currency displays
    let pointString = `${formatNumber(points, 2)} Points (${formatNumber(pointGain, 2)}/s)`;
    ctx.fillText(`${pointString}`, 10, c.height - 20);
}


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
    if (logToConsole) console.log(upgNum);

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