const fs = require("fs");

function fixFile(path) {
  let s = fs.readFileSync(path, "utf8");
  // Match [anything](http://anything) where the bracket and url content are the same
  // Use a more lenient pattern
  const pattern = /\[([^\]]+)\]\(http:\/\/[^)]+\)/g;
  const matches = s.match(pattern) || [];
  console.log(path, "matches:", matches.length);
  matches.slice(0,5).forEach(m => console.log(" ", m));
  s = s.replace(pattern, "$1");
  fs.writeFileSync(path, s, "utf8");
}

fixFile("src/components/schedule/admin-panel.tsx");
fixFile("src/components/schedule/availability-grid.tsx");
console.log("done");
