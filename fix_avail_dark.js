const fs = require("fs");
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");

// Fix corrupted bullet
ag = ag.replace(/Â·/g, "·");

// Fix badges - dark theme
ag = ag.replace(
  `{isWeekend && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-200 text-orange-700 font-semibold">Mandatory</span>}`,
  `{isWeekend && <span style={{backgroundColor:'rgba(255,99,87,0.2)',color:'#FF6357',fontSize:'11px',fontWeight:700,padding:'3px 8px',borderRadius:'20px'}}>Mandatory</span>}`
);
ag = ag.replace(
  `{isSunday && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-semibold">Free pick</span>}`,
  `{isSunday && <span style={{backgroundColor:'rgba(168,85,247,0.2)',color:'#A855F7',fontSize:'11px',fontWeight:700,padding:'3px 8px',borderRadius:'20px'}}>Free pick</span>}`
);
ag = ag.replace(
  `{isScheduled && <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6357] text-white font-semibold">Scheduled</span>}`,
  `{isScheduled && <span style={{backgroundColor:'#FF6357',color:'white',fontSize:'11px',fontWeight:700,padding:'3px 8px',borderRadius:'20px'}}>Scheduled</span>}`
);
ag = ag.replace(
  `{selected && <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', selectedShift?.bg, selectedShift?.textColor)}>{selectedShift?.time}</span>}`,
  `{selected && <span style={{backgroundColor:'rgba(255,99,87,0.2)',color:'#FF6357',fontSize:'11px',fontWeight:700,padding:'3px 8px',borderRadius:'20px'}}>{selectedShift?.time}</span>}`
);

// Fix shift buttons - dark theme
ag = ag.replace(
  `                    <button key={shift.key}
                      onClick={() => !isDisabled && selectShift(dayIndex, shift.key)}
                      disabled={isDisabled}
                      className={cn(
                        'rounded-2xl border-2 p-3 text-center transition-all duration-150 relative',
                        isSelected
                          ? cn(shift.color, 'border-transparent text-white shadow-md scale-[1.02]')
                          : isDisabled
                          ? 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'
                          : cn('bg-white', shift.border, 'hover:' + shift.bg, 'cursor-pointer')
                      )}>
                      <p className="text-base">{shift.icon}</p>
                      <p className={cn('text-xs font-bold mt-0.5', isSelected ? 'text-white' : shift.textColor)}>{shift.key}</p>
                      <p className={cn('text-xs mt-0.5', isSelected ? 'text-white/80' : 'text-gray-400')}>{shift.time}</p>
                      {isSelected && <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center"><Check size={10} className="text-white"/></div>}
                      {isDisabled && <p className="text-xs text-gray-400 mt-0.5">Full</p>}
                    </button>`,
  `                    <button key={shift.key}
                      onClick={() => !isDisabled && selectShift(dayIndex, shift.key)}
                      disabled={isDisabled}
                      style={{
                        borderRadius:'12px', padding:'12px 8px', textAlign:'center',
                        border: isSelected ? '2px solid transparent' : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: isSelected ? shift.activeColor : isDisabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.35 : 1,
                        transition: 'all 0.15s',
                        position: 'relative',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
                      }}>
                      <p style={{fontSize:'18px',marginBottom:'4px'}}>{shift.icon}</p>
                      <p style={{fontSize:'11px',fontWeight:700,color: isSelected ? 'white' : shift.darkColor}}>{shift.key}</p>
                      <p style={{fontSize:'10px',color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(247,240,232,0.35)',marginTop:'2px'}}>{shift.time}</p>
                      {isSelected && <div style={{position:'absolute',top:'6px',right:'6px',width:'16px',height:'16px',borderRadius:'50%',backgroundColor:'rgba(255,255,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><Check size={9} color="white"/></div>}
                      {isDisabled && <p style={{fontSize:'10px',color:'rgba(247,240,232,0.3)',marginTop:'2px'}}>Full</p>}
                    </button>`
);

// Fix shift buttons - add submit button dark
ag = ag.replace(
  `          <span className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-100 text-green-700 text-sm font-bold">
            <Check size={16}/> Submitted
          </span>`,
  `          <span style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'12px',backgroundColor:'rgba(34,197,94,0.15)',color:'#22c55e',fontSize:'13px',fontWeight:700}}>
            <Check size={14}/> Submitted
          </span>`
);
ag = ag.replace(
  `            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">`,
  `            style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'12px',backgroundColor:'#FF6357',color:'white',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',boxShadow:'0 2px 12px rgba(255,99,87,0.4)'}}>` 
);

// Add activeColor and darkColor to SHIFTS
ag = ag.replace(
  `  { key: 'AM',  label: 'AM Shift',  time: '8am - 4pm',  startH: 8,  endH: 16, color: 'bg-amber-400',   textColor: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   icon: '☀️' },
  { key: 'MID', label: 'MID Shift', time: '12pm - 8pm', startH: 12, endH: 20, color: 'bg-orange-400',  textColor: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  icon: '🌤️' },
  { key: 'PM',  label: 'PM Shift',  time: '4pm - 12am', startH: 16, endH: 24, color: 'bg-indigo-500',  textColor: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  icon: '🌙' },`,
  `  { key: 'AM',  label: 'AM Shift',  time: '8am - 4pm',  startH: 8,  endH: 16, color: 'bg-amber-400', activeColor: '#f59e0b', darkColor: '#fbbf24', textColor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: '☀️' },
  { key: 'MID', label: 'MID Shift', time: '12pm - 8pm', startH: 12, endH: 20, color: 'bg-orange-400', activeColor: '#f97316', darkColor: '#fb923c', textColor: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: '🌤️' },
  { key: 'PM',  label: 'PM Shift',  time: '4pm - 12am', startH: 16, endH: 24, color: 'bg-indigo-500', activeColor: '#6366f1', darkColor: '#818cf8', textColor: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: '🌙' },`
);

// Fix shift counters - dark
ag = ag.replace(
  `        <div key={shift.key} style={{backgroundColor:'#242424',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.08)',padding:'14px',textAlign:'center'}}>
          <p className="text-lg">{shift.icon}</p>
          <p className={cn('text-sm font-bold', shift.textColor)}>{shift.key}</p>
          <p className="text-xs text-gray-400">{shift.time}</p>
          <p className={cn('text-xl font-black mt-1', shift.textColor)}>{shiftCounts[shift.key]}<span className="text-xs font-normal text-gray-400">/{MAX_PER_TYPE}</span></p>
        </div>`,
  `        <div key={shift.key} style={{backgroundColor:'#242424',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.08)',padding:'14px',textAlign:'center'}}>
          <p style={{fontSize:'20px',marginBottom:'6px'}}>{shift.icon}</p>
          <p style={{color:shift.darkColor,fontSize:'12px',fontWeight:700}}>{shift.key}</p>
          <p style={{color:'rgba(247,240,232,0.35)',fontSize:'11px',marginTop:'2px'}}>{shift.time}</p>
          <p style={{color:shift.darkColor,fontSize:'22px',fontWeight:900,marginTop:'6px'}}>{shiftCounts[shift.key]}<span style={{color:'rgba(247,240,232,0.3)',fontSize:'11px',fontWeight:400}}>/{MAX_PER_TYPE}</span></p>
        </div>`
);

// Fix shift grid padding
ag = ag.replace(
  `              <div className="p-4 grid grid-cols-3 gap-3">`,
  `              <div style={{padding:'12px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>`
);

fs.writeFileSync("src/components/schedule/availability-grid.tsx", ag, "utf8");
console.log("done");
