const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Add editHours state after generatedSlots state
ap = ap.replace(
  "  const [generatedSlots,setGeneratedSlots]=useState<any[]>([])",
  `  const [generatedSlots,setGeneratedSlots]=useState<any[]>([])
  const [editingHours,setEditingHours]=useState<string|null>(null) // key = slotKey_memberId`
);

// Replace the hours display + role badge section with editable version
// Find the span showing totalH and add edit button + inline editor
ap = ap.replace(
  `                            {info&&<span style={{color:CORAL,fontSize:'12px',fontWeight:700}}>{info.totalH}h</span>}`,
  `                            {info&&(
                              <span
                                onClick={()=>setEditingHours(editingHours===slot.key+'_'+member.id?null:slot.key+'_'+member.id)}
                                style={{color:CORAL,fontSize:'12px',fontWeight:700,cursor:'pointer',textDecoration:'underline',textDecorationStyle:'dotted'}}
                                title="Click to edit hours"
                              >{info.totalH}h ✎</span>
                            )}`
);

// Add inline hour editor after the top row div (after the flexWrap row closes before timeline)
ap = ap.replace(
  `                          {info&&(
                            <div>
                              <div style={{position:'relative',height:'18px'`,
  `                          {editingHours===slot.key+'_'+member.id&&info&&(
                            <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 0 4px',flexWrap:'wrap'}}>
                              <span style={{color:MUTED,fontSize:'11px',fontWeight:600}}>Start:</span>
                              <select value={info.startH} onChange={e=>{
                                const newStart=parseInt(e.target.value)
                                setGeneratedSlots((prev:any[])=>prev.map((gs:any)=>gs.key!==slot.key?gs:{...gs,staff:gs.staff.map((m:any)=>m.id!==member.id?m:{...m,info:{...m.info,startH:newStart,totalH:m.info.endH-newStart}})}))
                              }} style={{backgroundColor:'#2e2e2e',color:CREAM,border:'1px solid rgba(255,255,255,0.15)',borderRadius:'6px',padding:'3px 6px',fontSize:'12px',cursor:'pointer'}}>
                                {Array.from({length:16},(_,i)=>i+8).map(h=>(
                                  <option key={h} value={h}>{h===12?'12pm':h<12?h+'am':(h-12)+'pm'}</option>
                                ))}
                              </select>
                              <span style={{color:MUTED,fontSize:'11px',fontWeight:600}}>End:</span>
                              <select value={info.endH} onChange={e=>{
                                const newEnd=parseInt(e.target.value)
                                setGeneratedSlots((prev:any[])=>prev.map((gs:any)=>gs.key!==slot.key?gs:{...gs,staff:gs.staff.map((m:any)=>m.id!==member.id?m:{...m,info:{...m.info,endH:newEnd,totalH:newEnd-m.info.startH}})}))
                              }} style={{backgroundColor:'#2e2e2e',color:CREAM,border:'1px solid rgba(255,255,255,0.15)',borderRadius:'6px',padding:'3px 6px',fontSize:'12px',cursor:'pointer'}}>
                                {Array.from({length:16},(_,i)=>i+9).map(h=>(
                                  <option key={h} value={h}>{h===12?'12pm':h===24?'12am':h<12?h+'am':(h-12)+'pm'}</option>
                                ))}
                              </select>
                              <button onClick={()=>setEditingHours(null)} style={{color:MUTED,fontSize:'11px',background:'none',border:'none',cursor:'pointer'}}>✓ done</button>
                            </div>
                          )}
                          {info&&(
                            <div>
                              <div style={{position:'relative',height:'18px'`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
