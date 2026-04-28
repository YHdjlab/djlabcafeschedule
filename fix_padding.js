const fs = require("fs");
let layout = fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8");
layout = layout.replace(
  '<div style={{padding:"36px 40px 60px 40px", boxSizing:"border-box", width:"100%"}}>',
  '<div style={{padding:"36px 48px 60px 40px", boxSizing:"border-box", width:"100%"}}>'
);
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log("done");
