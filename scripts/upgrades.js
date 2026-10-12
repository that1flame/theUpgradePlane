// This is gonna be a LONG list eventually so i put it in its own script
var upgrades = [
    // For whatever fucking reason, detecting vars as "NaN" doesn't so shit so I have to use -999
    { id: "U1", cost: 0, costMult: 0, bought: 0, max: 10, boost: -999, title: "Fresh Start", desc: "+1 Points/s per Level", req: [ "" ] },
    { id: "U2", cost: 100, costMult: 1.5, bought: 0, max: 50, boost: -999, title: "Multiplying", desc: "+1x Points/s per Level", req: [ "U1" ] },
    { id: "U3", cost: 500, costMult: 2, bought: 0, max: 20, boost: 1, title: "Self-Boost", desc: "A % of Points boosts itself. Each Level increases the %", req: [ "U1" ] }
]

function log(num, base) {
    return Math.log10(num) / Math.log10(base);
}

let indexNum;
function manageBoosts() {
    indexNum = upgrades.findIndex(item => item.id == "U3")
    // Boost Format: boost = (has it been bought) ? boost forumla : default amount;
    upgrades[indexNum].boost = (upgrades[indexNum].bought > 0) ? log((points * (0.05 * upgrades[indexNum].bought)) + 1, 20) + 1 : 1;
}