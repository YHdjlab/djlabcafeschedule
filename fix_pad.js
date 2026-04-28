const fs = require("fs");
let layout = fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8");
layout = layout.replace(
  '<div style={{padding:"36px 48px 60px 40px"}}>',
  '<div style={{padding:"36px 32px 60px 32px"}}>'
);
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log(require("fs").readFileSync("src/app/(dashboard)/layout.tsx","utf8").match(/padding.*/)[0]);
