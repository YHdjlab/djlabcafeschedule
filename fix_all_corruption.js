const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix ALL markdown link corruptions in the entire file
ap = ap.replace(/\[(\w[\w.]*)\]\(http:\/\/[\w.]+\)/g, "$1");

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");

// Verify key lines
const lines = ap.split("\n");
const staffMapLine = lines.find(l => l.includes("STAFF_MAP") && l.includes("fromEntries"));
const supRolesLine = lines.find(l => l.includes("supRoles"));
const availSupsLine = lines.find(l => l.includes("availSups"));
console.log("STAFF_MAP:", staffMapLine?.trim());
console.log("supRoles:", supRolesLine?.trim());
console.log("availSups:", availSupsLine?.trim());
