const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix all markdown link corruptions
ap = ap.replace(/\[activeStaff\.map\]\(http:\/\/activeStaff\.map\)/g, "activeStaff.map");
ap = ap.replace(/\[s\.id\]\(http:\/\/s\.id\)/g, "s.id");
ap = ap.replace(/\[member\.id\]\(http:\/\/member\.id\)/g, "member.id");
ap = ap.replace(/\[alts\.map\]\(http:\/\/alts\.map\)/g, "alts.map");
ap = ap.replace(/\[user\.id\]\(http:\/\/user\.id\)/g, "user.id");
ap = ap.replace(/\[slot\.bar\]\(http:\/\/slot\.bar\)/g, "slot.bar");

// Also fix any other common patterns
ap = ap.replace(/\[(\w+)\.(\w+)\]\(http:\/\/\1\.\2\)/g, "$1.$2");

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");

// Verify
const line = ap.split("\n").find(l => l.includes("STAFF_MAP") && l.includes("fromEntries"));
console.log("STAFF_MAP line:", line);
