// Detects if a key is pressed
document.addEventListener("keydown", (event) => {
    isKeyNav = true;

    // Check if the pressed key was the Left Arrow key
    if (event.code === "ArrowLeft") {
        console.log("Left arrow pressed");
        detectNearestUpg("left");
    }

    // Check if the pressed key was the Right Arrow key
    if (event.code === "ArrowRight") {
        console.log("Right arrow pressed");
        detectNearestUpg("right");
    }

    // Check if the pressed key was the Up Arrow key
    if (event.code === "ArrowUp") {
        console.log("Up arrow pressed");
        detectNearestUpg("up");
    }

    // Check if the pressed key was the Down Arrow key
    if (event.code === "ArrowDown") {
        console.log("Down arrow pressed");
        detectNearestUpg("down");
    }

    if (event.code === "Enter") {
        console.log("Enter key pressed.");
        buttonClick(selected);
    }
})

function detectNearestUpg(dir) {
    if (selected == "") {
        selected = "U1";
        x = (movingObjs[0].coords[0] * scale);
        y = -(movingObjs[0].coords[1] * scale);
    }
    else {
        // TODO -- Select upgrade based on direction and not just the ID
        // TODO -- Only navigate to a new upgrade if it's unlocked
        if (dir == "up" || dir == "right") {
            if (upgrades[getindexNum(selected) + 1].unlocked) {
                selected = upgrades[getindexNum(selected) + 1].id;
                // This works as long as the upgrade order in movingObjs[] is IDENTICAL to upgrades[].
                // For the love of god do not ruin that so I don't have to make a workaround
                isCameraLerp = true;
                cameraLerp(movingObjs[getindexNum(selected)].coords[0] * scale, -(movingObjs[getindexNum(selected)].coords[1] * scale));
            }
        }
        if (dir == "down" || dir == "left") {
            if (upgrades[getindexNum(selected)].unlocked) {
                selected = upgrades[getindexNum(selected) - 1].id;
                // Same applies for down here. I'm not copying the comment.
                isCameraLerp = true;
                cameraLerp(movingObjs[getindexNum(selected)].coords[0] * scale, -(movingObjs[getindexNum(selected)].coords[1] * scale));
            }
        }
    }
}

function cameraLerp(new_X, new_Y) {
    newX = new_X;
    newY = new_Y;

    Xdiff = newX - x;
    Ydiff = newY - y;
}