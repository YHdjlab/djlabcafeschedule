const fs = require("fs");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const layout = fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8");
console.log("CSS last 300:", css.slice(-300));
console.log("Layout main:", layout.split("\n").filter(l => l.includes("<main")).join("\n"));
