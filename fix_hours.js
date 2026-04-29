const fs = require("fs");
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");

// Show every hour label, not just even ones
ag = ag.replace(
  "{h%2===0&&<span style={{position:'absolute',bottom:'-13px',left:'50%',transform:'translateX(-50%)',color:'rgba(247,240,232,0.25)',fontSize:'8px',fontWeight:600,whiteSpace:'nowrap',pointerEvents:'none'}}>{fmtH(h)}</span>}",
  "<span style={{position:'absolute',bottom:'-13px',left:'50%',transform:'translateX(-50%)',color:'rgba(247,240,232,0.25)',fontSize:'7px',fontWeight:600,whiteSpace:'nowrap',pointerEvents:'none'}}>{fmtH(h)}</span>"
);

fs.writeFileSync("src/components/schedule/availability-grid.tsx", ag, "utf8");
console.log("done");
