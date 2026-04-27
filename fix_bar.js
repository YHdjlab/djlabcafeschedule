const fs = require("fs");
let sv = fs.readFileSync("src/components/schedule/schedule-view.tsx", "utf8");

// The bar uses startH/endH from slot but the fill calculation uses (startH-8)/16
// Problem: startH comes from slot.start_time which is correct
// But the fill left position needs to account for offset from 8am

// Fix the timeline bar fill - use actual slot start/end times
sv = sv.replace(
  `              <div className="absolute h-full rounded-full transition-all" style={{
                                left: Math.max(0,(startH-8)/16*100)+'%',
                                width: Math.min(100,(endH-startH)/16*100)+'%',
                                backgroundColor: s.isMe ? '#FF6357' : s.color,
                                opacity: 0.85
                              }}/>`,
  `              <div className="absolute h-full rounded-full transition-all" style={{
                                left: Math.max(0, (startH - 8) / 16 * 100) + '%',
                                width: Math.min(100 - Math.max(0, (startH - 8) / 16 * 100), (endH - startH) / 16 * 100) + '%',
                                backgroundColor: s.isMe ? '#FF6357' : s.color,
                                opacity: 0.9
                              }}/>`
);

// Also fix start/end labels inside bar to show correct times
sv = sv.replace(
  `              <div className="absolute inset-0 flex items-center px-2 justify-between pointer-events-none">
                                <span className="text-white font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(slot.start_time)}</span>
                                <span className="text-white font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(slot.end_time)}</span>
                              </div>`,
  `              {/* start/end labels positioned at actual bar location */}
                              <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{
                                left: Math.max(0, (startH - 8) / 16 * 100) + '%',
                                width: Math.min(100 - Math.max(0, (startH - 8) / 16 * 100), (endH - startH) / 16 * 100) + '%',
                              }}>
                                <div className="w-full flex items-center justify-between px-2">
                                  <span className="text-white font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(slot.start_time)}</span>
                                  <span className="text-white font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(slot.end_time)}</span>
                                </div>
                              </div>`
);

fs.writeFileSync("src/components/schedule/schedule-view.tsx", sv, "utf8");
console.log("done");
