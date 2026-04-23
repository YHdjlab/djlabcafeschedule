const fs = require("fs");
let seed = fs.readFileSync("seed_availability.js", "utf8");
seed = seed.replace("          submitted: true,", "");
fs.writeFileSync("seed_availability.js", seed, "utf8");
console.log("removed submitted field");
