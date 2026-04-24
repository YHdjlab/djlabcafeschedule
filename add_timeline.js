const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace the staff card inner content to add timeline bar
ap = ap.replace(
  `                        <div className="flex items-center gap-4">
                          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                              <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                            </div>
                            {info ? (
                              <p className="text-sm text-gray-500 mt-0.5">{fmtH(info.startH)} - {fmtH(info.endH)} <span className="font-bold text-[#FF6357] ml-1">{info.totalH}h</span></p>
                            ) : (
                              <p className="text-sm text-gray-400 mt-0.5">Hours unknown</p>
                            )}
                          </div>
                        </div>`,
  `                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-base font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                              <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                              {info && <span className="text-xs font-bold text-[#FF6357] ml-auto">{info.totalH}h</span>}
                            </div>
                            {info ? (
                              <div className="relative">
                                {/* Timeline bar: 8am to 12am = 16 hours */}
                                <div className="relative h-5 rounded-full overflow-hidden" style={{backgroundColor: 'rgba(0,0,0,0.06)'}}>
                                  {/* Rush band background */}
                                  <div className="absolute h-full opacity-30" style={{
                                    left: ((slot.rushStartH - 8) / 16 * 100) + '%',
                                    width: ((slot.rushEndH - slot.rushStartH) / 16 * 100) + '%',
                                    backgroundColor: '#FB923C'
                                  }}/>
                                  {/* Staff hours fill */}
                                  <div className="absolute h-full rounded-full transition-all duration-500" style={{
                                    left: Math.max(0, (info.startH - 8) / 16 * 100) + '%',
                                    width: Math.min(100, (info.totalH / 16 * 100)) + '%',
                                    backgroundColor: member.role === 'Supervisor' ? '#3B82F6' : member.role === 'Bar' ? '#A855F7' : '#22C55E',
                                    opacity: 0.85
                                  }}/>
                                  {/* Time labels inside bar */}
                                  <div className="absolute inset-0 flex items-center px-2 justify-between pointer-events-none">
                                    <span className="text-white text-xs font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(info.startH)}</span>
                                    <span className="text-white text-xs font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(info.endH)}</span>
                                  </div>
                                </div>
                                {/* Hour markers */}
                                <div className="flex justify-between mt-1 px-0.5">
                                  {[8,10,12,14,16,18,20,22,24].map(h => (
                                    <span key={h} className="text-gray-300" style={{fontSize:'9px', fontWeight:600}}>{h===24?'12a':h===12?'12p':h>12?h-12+'p':h+'a'}</span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="h-5 rounded-full" style={{backgroundColor: 'rgba(0,0,0,0.06)'}}/>
                            )}
                          </div>
                        </div>`
);

// Fix the corrupted bullet
ap = ap.replace(/Â·/g, "·");

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
