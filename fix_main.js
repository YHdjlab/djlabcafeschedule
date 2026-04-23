const fs = require("fs");
let layout = fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8");
layout = layout.replace(
  '<main className="sidebar-offset min-h-screen">',
  '<main className="min-h-screen" style={{marginLeft: "0px"}} id="main-content">'
);
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");

let css = fs.readFileSync("src/app/globals.css", "utf8");
css = css + '\n@media (min-width: 1024px) {\n  #main-content { margin-left: 240px !important; }\n}\n';
fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("Done");
console.log(fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8").split("\n").filter(l => l.includes("main")).join("\n"));
