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
    ctx.strokeStyle = "rgb(5, 5, 5)";
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

            // Stops the function if the upgrade hasn't been unlocked
            if (isUnlocked(fullID)) continue;

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
            if (touchingMouse(localX * scale, -localY * scale, width * scale, height * scale) || selected == fullID) {
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
                /* console.log(`Orig: ${upgrades[upgNum].desc.length} | New: ${descString.length}`); */
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
                /* console.log(`Loop ${i} | min: ${stringMin}, max: ${stringMax}`) */
            }
            // #endregion
        }
    }

    // Draws the camera pos display (defined here cuz why not)
    let posString = `X: ${formatNumber(x, 0)}, Y: ${formatNumber(-y, 0)}`;
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

    // MAYBE TEMPORARY arrow-key selected display
    let selectString = `Selected: ${selected}`;
    ctx.textAlign = "right";
    ctx.fillText(`${selectString}`, c.width - 10, 50);

    // Draws the zoom display
    let zoomString = `Zoom: x${formatNumber(scale, 2)}`;
    ctx.textAlign = "left";
    ctx.fillText(`${zoomString}`, 10, 30);

    // Draws the currency displays
    let pointString = `${formatNumber(points, 2)} Points (${formatNumber(pointGain, 2)}/s)`;
    ctx.fillText(`${pointString}`, 10, c.height - 20);
}