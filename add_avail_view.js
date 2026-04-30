const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Find the Schedule tab and add an "Availability" view section
// First, let's add a new view at the top of ScheduleBuilderTab to toggle between schedule and availability views

// Add view state and availability viewer
ap = ap.replace(
  "  const [generatedSlots,setGeneratedSlots]=useState<any[]>([])",
  `  const [generatedSlots,setGeneratedSlots]=useState<any[]>([])
  const [scheduleView,setScheduleView]=useState<'builder'|'availability'>('builder')`
);

// Add tabs at the top of the schedule tab content (after the week navigator card)
ap = ap.replace(
  `      {pendingWeek.length>0&&profile.role==='gm'&&(`,
  `      {/* View toggle */}
      <div style={{display:'flex',gap:'4px'}}>
        <button onClick={()=>setScheduleView('builder')} style={{flex:1,padding:'10px',borderRadius:'10px',border:'none',cursor:'pointer',backgroundColor:scheduleView==='builder'?CORAL:'rgba(255,255,255,0.06)',color:scheduleView==='builder'?'white':MUTED,fontSize:'13px',fontWeight:600}}>Schedule Builder</button>
        <button onClick={()=>setScheduleView('availability')} style={{flex:1,padding:'10px',borderRadius:'10px',border:'none',cursor:'pointer',backgroundColor:scheduleView==='availability'?CORAL:'rgba(255,255,255,0.06)',color:scheduleView==='availability'?'white':MUTED,fontSize:'13px',fontWeight:600}}>Staff Availability</button>
      </div>

      {scheduleView==='availability'&&(
        <div style={S.card}>
          <p style={{...S.title,marginBottom:'14px'}}>Staff Blocked Hours</p>
          <p style={{color:MUTED,fontSize:'12px',marginBottom:'18px'}}>Red blocks = staff cannot work. Click any block to view details.</p>
          {activeStaff.map((s:any)=>{
            const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
            const DATES=Array.from({length:7},(_,i)=>{const d=new Date(weekStart+'T00:00:00');d.setDate(d.getDate()+i);return d.toISOString().slice(0,10)})
            const totalBlocked=DATES.reduce((sum:number,date:string)=>{
              return sum+weekAvailability.filter((a:any)=>a.staff_id===s.id&&a.slot_date===date).length<16?16-weekAvailability.filter((a:any)=>a.staff_id===s.id&&a.slot_date===date).length:0
            },0)
            const allWeekAvail=availability.filter((a:any)=>a.staff_id===s.id&&a.week_starting===weekStart)
            const blockedHours=allWeekAvail.filter((a:any)=>!a.available).length
            const totalHoursBlocked=blockedHours
            return(
              <div key={s.id} style={{marginBottom:'18px',padding:'14px',backgroundColor:CARD2,borderRadius:'12px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'32px',height:'32px',borderRadius:'50%',backgroundColor:CORAL,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{color:'white',fontSize:'12px',fontWeight:700}}>{s.full_name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p style={{color:CREAM,fontSize:'13px',fontWeight:600}}>{s.full_name}</p>
                      <p style={{color:MUTED,fontSize:'11px'}}>{ROLE_LABELS[s.role]||s.role}</p>
                    </div>
                  </div>
                  <span style={{backgroundColor:totalHoursBlocked===0?'#22c55e20':totalHoursBlocked>40?'#ef444420':'#f9731620',color:totalHoursBlocked===0?'#22c55e':totalHoursBlocked>40?'#ef4444':'#f97316',fontSize:'11px',fontWeight:700,padding:'4px 10px',borderRadius:'20px'}}>{totalHoursBlocked}h blocked</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'40px repeat(16,1fr)',gap:'2px',fontSize:'9px'}}>
                  <div></div>
                  {Array.from({length:16},(_,i)=>i+8).map(h=>(
                    <div key={h} style={{color:MUTED,textAlign:'center',fontSize:'8px',fontWeight:600}}>{h===24?'12a':h===12?'12p':h>12?(h-12)+'p':h+'a'}</div>
                  ))}
                  {DAYS.map((day:string,di:number)=>{
                    const date=DATES[di]
                    return[
                      <div key={day} style={{color:MUTED,fontSize:'10px',fontWeight:600,display:'flex',alignItems:'center'}}>{day}</div>,
                      ...Array.from({length:16},(_,i)=>i+8).map((h:number)=>{
                        const slot=allWeekAvail.find((a:any)=>a.slot_date===date&&a.slot_key===date+'_h'+h)
                        const isBlocked=slot&&!slot.available
                        return(
                          <div key={day+'_'+h} title={day+' '+(h===24?'12am':h===12?'12pm':h>12?(h-12)+'pm':h+'am')+(isBlocked?' - BLOCKED':' - Available')} style={{height:'20px',borderRadius:'3px',backgroundColor:isBlocked?'#ef4444':'#22c55e30',cursor:'help'}}/>
                        )
                      })
                    ]
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {scheduleView==='builder'&&pendingWeek.length>0&&profile.role==='gm'&&(`
);

// Wrap the rest of the builder content to only show in builder view
ap = ap.replace(
  `      {generatedSlots.length>0?(`,
  `      {scheduleView==='builder'&&generatedSlots.length>0?(`
);

ap = ap.replace(
  `      ):(
        <button onClick={generateSchedule} disabled={generating} style={{...S.btnGhost,width:'100%',justifyContent:'center',padding:'16px',fontSize:'14px',borderRadius:'14px'}}>
          <Zap size={16} style={{color:CORAL}}/>{generating?'Generating...':'Auto-Generate Schedule from Availability'}
        </button>
      )}`,
  `      ):scheduleView==='builder'?(
        <button onClick={generateSchedule} disabled={generating} style={{...S.btnGhost,width:'100%',justifyContent:'center',padding:'16px',fontSize:'14px',borderRadius:'14px'}}>
          <Zap size={16} style={{color:CORAL}}/>{generating?'Generating...':'Auto-Generate Schedule from Availability'}
        </button>
      ):null}`
);

// Also wrap approvedWeek to only show in builder view
ap = ap.replace(
  `      {approvedWeek.length>0&&(`,
  `      {scheduleView==='builder'&&approvedWeek.length>0&&(`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
