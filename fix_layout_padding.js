const fs = require("fs");

// Fix the main layout padding - add right padding
let layout = fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8");
layout = layout.replace(
  '<div style={{padding: "32px"}}>{children}</div>',
  '<div style={{padding: "32px 32px 32px 32px"}}>{children}</div>'
);
// The real fix - the main needs overflow protection and proper right padding
layout = layout.replace(
  '<main style={{paddingLeft: "240px"}} className="min-h-screen hidden lg:block">',
  '<main style={{paddingLeft: "240px"}} className="min-h-screen hidden lg:block overflow-x-hidden">'
);
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log("layout fixed");

// Fix globals - add right padding to content wrapper
let css = fs.readFileSync("src/app/globals.css", "utf8");
if (!css.includes("box-sizing")) {
  css = css.replace(
    "* {\n  box-sizing: border-box;",
    "* {\n  box-sizing: border-box;"
  );
}
fs.writeFileSync("src/app/globals.css", css, "utf8");
