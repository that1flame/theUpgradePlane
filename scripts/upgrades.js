// This is gonna be a LONG list eventually so i put it in its own script
var upgrades = [
    // For whatever fucking reason, detecting vars as "NaN" doesn't so shit so I have to use -999
    // Also: a costMulti at 0 either means the cost is added (like U1) or its only bought once (like U5)
    { id: "U1", cost: 0, costMult: 0, bought: 0, max: 10, boost: -999, title: "Fresh Start", desc: "+1 Points/s per Level", req: [ "" ] },
    { id: "U2", cost: 100, costMult: 1.2, bought: 0, max: 50, boost: -999, title: "Multiplying", desc: "+1x Points/s per Level", req: [ "U1" ] },
    { id: "U3", cost: 200, costMult: 1.5, bought: 0, max: 20, boost: 1, title: "Self-Boost", desc: "A % of Points boosts itself. Each Level increases the %", req: [ "U1" ] },
    { id: "U4", cost: 500, costMult: 1.4, bought: 0, max: 10, boost: 1, title: "True Multiplying", desc: "1.15x Points/s per Level", req: [ "U2" ] },
    { id: "U5", cost: 3000, costMult: 0, bought: 0, max: 1, boost: 1, title: "Conditionally", desc: "3x Point Gain if current Points < 10,000. Else, 1.5x Point gain", req: [ "U3" ] },
]

function log(num, base) {
    return Math.log10(num) / Math.log10(base);
}

function getindexNum(id) {
    return upgrades.findIndex(item => item.id == id);
}

function isUnlocked(fullID) {
    // First: Detect if the upgrade has even been unlocked
    let upgNum = upgrades.findIndex(item => item.id == fullID);
    let reqs = upgrades[upgNum].req.length;
    let unlocked = 0;
    /* console.log(`fullID: ${fullID} | upgNum: ${upgNum} | reqs: ${reqs} | unlocked: ${unlocked}`); */
    for (let j = 0; j < reqs; j++) {
        // Case 1: No requirement
        if (upgrades[upgNum].req[j] == "") {
            unlocked += 1;
            break;
        }

        // Case 2: Normal upgrade requirement
        let numToCheck = upgrades.findIndex(item => item.id == upgrades[upgNum].req[j]);
        /* console.log(`req: ${upgrades[upgNum].req[j]} | numToCheck: ${numToCheck}`); */
        if (upgrades[numToCheck].bought > 0) {
            unlocked += 1;
        }
    }

    return (unlocked != reqs) ? true : false;
}

let indexNum;
function manageBoosts() {
    indexNum = upgrades.findIndex(item => item.id == "U3")
    // Boost Format: boost = (has it been bought) ? boost forumla : default amount;
    upgrades[indexNum].boost = (upgrades[indexNum].bought > 0) ? log((points * (0.05 * upgrades[indexNum].bought)) + 1, 20) + 1 : 1;

    indexNum = upgrades.findIndex(item => item.id == "U4")
    upgrades[indexNum].boost = (upgrades[indexNum].bought > 0) ? 1.15 ** upgrades[indexNum].bought : 1;

    indexNum = upgrades.findIndex(item => item.id == "U5")
    upgrades[indexNum].boost = (upgrades[indexNum].bought > 0) ? ((points < 10000) ? 3 : 1.5) : 1;
}