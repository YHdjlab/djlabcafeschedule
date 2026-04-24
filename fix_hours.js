const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  `                                {/* Hour markers */}
                                <div className="flex justify-between mt-1 px-0.5">
                                  {[8,10,12,14,16,18,20,22,24].map(h => (
                                    <span key={h} className="text-gray-300" style={{fontSize:'9px', fontWeight:600}}>{h===24?'12a':h===12?'12p':h>12?h-12+'p':h+'a'}</span>
                                  ))}
                                </div>`,
  `                                {/* Hour markers - every hour 8a to 12a */}
                                <div className="relative mt-1" style={{height:'12px'}}>
                                  {[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].map(h => (
                                    <span key={h} className="absolute text-gray-400" style={{
                                      left: ((h-8)/16*100)+'%',
                                      fontSize:'8px', fontWeight:600,
                                      transform:'translateX(-50%)',
                                      whiteSpace:'nowrap'
                                    }}>
                                      {h===24?'12a':h===12?'12p':h>12?(h-12)+'p':h+'a'}
                                    </span>
                                  ))}
                                </div>`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
