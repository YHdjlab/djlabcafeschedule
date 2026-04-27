const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  `                                  {/* Time labels inside bar */}
                                  <div className="absolute inset-0 flex items-center px-2 justify-between pointer-events-none">
                                    <span className="text-white text-xs font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(info.startH)}</span>
                                    <span className="text-white text-xs font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(info.endH)}</span>
                                  </div>`,
  `                                  {/* Time labels positioned at fill location */}
                                  <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{
                                    left: Math.max(0, (info.startH - 8) / 16 * 100) + '%',
                                    width: Math.min(100 - Math.max(0, (info.startH - 8) / 16 * 100), (info.totalH / 16 * 100)) + '%',
                                  }}>
                                    <div className="w-full flex items-center justify-between px-1.5">
                                      <span className="text-white font-bold drop-shadow" style={{fontSize:'9px'}}>{fmtH(info.startH)}</span>
                                      <span className="text-white font-bold drop-shadow" style={{fontSize:'9px'}}>{fmtH(info.endH)}</span>
                                    </div>
                                  </div>`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");
