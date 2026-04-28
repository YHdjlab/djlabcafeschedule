const fs = require("fs");
let sv = fs.readFileSync("src/components/schedule/schedule-view.tsx", "utf8");
// Remove the duplicate className that became a style
sv = sv.replace(
  /style=\{\{position:'absolute',color:'rgba\(247,240,232,0\.3\)',fontSize:'8px',fontWeight:600,transform:'translateX\(-50%\)',whiteSpace:'nowrap'\}\} style=\{\{left:\(\(h-8\)\/16\*100\)\+'%',fontSize:'8px',fontWeight:600,transform:'translateX\(-50%\)',whiteSpace:'nowrap'\}\}/g,
  "style={{position:'absolute',color:'rgba(247,240,232,0.3)',left:((h-8)/16*100)+'%',fontSize:'8px',fontWeight:600,transform:'translateX(-50%)',whiteSpace:'nowrap'}}"
);
fs.writeFileSync("src/components/schedule/schedule-view.tsx", sv, "utf8");
console.log("fixed");
