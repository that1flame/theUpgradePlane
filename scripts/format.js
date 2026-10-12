// Formats numbers so you dont just see 8734595046 etc etc
// This is TERRIBLE I will implement BreakInfinity.js later
// TODO (for now) -- Add extra zeroes (i.e. 1.90 instead of 1.9) to prevent flashing
function formatNumber(num, precision) {
    let exponent = Math.floor(Math.log10(num));
    let mantissa = Math.round((num / 10 ** exponent) * 1000) / 1000; //Rounds the mantissa.. hopefully
    let rounding = 10 ** precision;
    let roundedNum;

    if (num < 1e9) {
        //Some nonsense to add commas between the numbers
        roundedNum = Math.floor(num * rounding) / rounding;
        if (num >= 1e6) return `${Math.floor(roundedNum / 1e6)},${Math.floor((roundedNum / 1000) % 1000).toString().padStart(3, '0')},${Math.floor(roundedNum % 1000).toString().padStart(3, '0')}`;
        else if (num >= 1e3) return `${Math.floor(roundedNum / 1000)},${(Math.floor(roundedNum % 1000)).toString().padStart(3, '0')}`;
        else return String(roundedNum);
    }
    else {
        //Scientific notation
        return String(mantissa + "e" + exponent)
    }
}