'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { format, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Send, Check } from 'lucide-react'

const CARD='#242424', BORDER='rgba(255,255,255,0.08)', CORAL='#FF6357', CREAM='#F7F0E8', MUTED='rgba(247,240,232,0.45)'
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const HOURS=Array.from({length:16},(_,i)=>i+8)
const WEEKEND=[4,5,6]
const SHIFTS=[{key:'AM',start:8,end:16,color:'#f59e0b'},{key:'MID',start:12,end:20,color:'#f97316'},{key:'PM',start:16,end:24,color:'#6366f1'}]
function fmtH(h:number){if(h===0||h===24)return'12am';if(h<12)return h+'am';if(h===12)return'12pm';return(h-12)+'pm'}

interface Props{profile:any;availability:any[];schedules:any[];nextMonday:string;currentMonday:string;rushConfig:any[]}

export function AvailabilityGrid({profile,availability,schedules,nextMonday,currentMonday,rushConfig}:Props){
  const [weekStart,setWeekStart]=useState(nextMonday)
  const supabase=createClient()
  const [saving,setSaving]=useState(false)
  const [savedMsg,setSavedMsg]=useState('')
  const [submitted,setSubmitted]=useState(()=>availability.some((a:any)=>a.week_starting===nextMonday&&a.submitted))
  const monday=new Date(weekStart+'T00:00:00')

  const [blocked,setBlocked]=useState<Record<string,boolean>>(()=>{
    const map:Record<string,boolean>={}
    availability.forEach((a:any)=>{
      if(a.week_starting===weekStart&&!a.available){
        const match=a.slot_key?.match(/_h(d+)$/)
        if(match){
          const mon=new Date(weekStart+'T00:00:00')
          for(let d=0;d<7;d++){
            if(format(addDays(mon,d),'yyyy-MM-dd')===a.slot_date){map[d+'_'+match[1]]=true;break}
          }
        }
      }
    })
    return map
  })

  const flash=(msg:string)=>{setSavedMsg(msg);setTimeout(()=>setSavedMsg(''),2000)}

  const toggleHour=async(dayIndex:number,hour:number)=>{
    if(WEEKEND.includes(dayIndex)&&!blocked[dayIndex+'_'+hour]){flash('Fri/Sat/Sun mandatory. Submit Day Off request if needed.');return}
    const key=dayIndex+'_'+hour
    const newBlocked=!blocked[key]
    setBlocked(prev=>({...prev,[key]:newBlocked}))
    const dateStr=format(addDays(monday,dayIndex),'yyyy-MM-dd')
    await supabase.from('availability').upsert({week_starting:weekStart,staff_id:profile.id,slot_key:dateStr+'_h'+hour,slot_label:DAYS[dayIndex]+' '+fmtH(hour),slot_date:dateStr,available:!newBlocked,submitted:false},{onConflict:'week_starting,staff_id,slot_key'})
    flash('Saved')
  }

  const submitWeek=async()=>{
    setSaving(true)
    const rows=[]
    for(let d=0;d<7;d++){
      const dateStr=format(addDays(monday,d),'yyyy-MM-dd')
      for(const h of HOURS){rows.push({week_starting:weekStart,staff_id:profile.id,slot_key:dateStr+'_h'+h,slot_label:DAYS[d]+' '+fmtH(h),slot_date:dateStr,available:!blocked[d+'_'+h],submitted:true})}
    }
    await supabase.from('availability').delete().eq('week_starting',weekStart).eq('staff_id',profile.id)
    await supabase.from('availability').upsert(rows,{onConflict:'week_starting,staff_id,slot_key'})
    setSubmitted(true);flash('Submitted!');setSaving(false)
  }

  const blockedCount=Object.values(blocked).filter(Boolean).length
  const weekdayConfig=rushConfig.find((r:any)=>r.day_type==='weekday')
  const rushStart=parseInt((weekdayConfig?.rush_start||'15:00').split(':')[0])
  const rushEnd=parseInt((weekdayConfig?.rush_end||'21:00').split(':')[0])

  return(
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <div style={{backgroundColor:CARD,borderRadius:'16px',border:`1px solid ${BORDER}`,padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
        <button onClick={()=>{const d=new Date(weekStart+'T00:00:00');d.setDate(d.getDate()-7);setWeekStart(format(d,'yyyy-MM-dd'));setBlocked({});setSubmitted(false)}} style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:`1px solid ${BORDER}`,color:CREAM,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><ChevronLeft size={16}/></button>
        <div style={{textAlign:'center'}}>
          <p style={{color:CREAM,fontSize:'14px',fontWeight:700}}>{format(monday,'MMM d')} – {format(addDays(monday,6),'MMM d, yyyy')}</p>
          <p style={{color:MUTED,fontSize:'12px',marginTop:'2px'}}>{blockedCount>0?blockedCount+' hours blocked':'All hours available'}</p>
        </div>
        <button onClick={()=>{const d=new Date(weekStart+'T00:00:00');d.setDate(d.getDate()+7);setWeekStart(format(d,'yyyy-MM-dd'));setBlocked({});setSubmitted(false)}} style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:`1px solid ${BORDER}`,color:CREAM,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><ChevronRight size={16}/></button>
      </div>

      <div style={{backgroundColor:CARD,borderRadius:'14px',border:`1px solid ${BORDER}`,padding:'12px 16px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}><div style={{width:'24px',height:'14px',borderRadius:'3px',backgroundColor:'rgba(239,68,68,0.35)',border:'2px solid rgba(239,68,68,0.6)'}}/><span style={{color:MUTED,fontSize:'12px'}}>Blocked</span></div>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}><div style={{width:'24px',height:'14px',borderRadius:'3px',backgroundColor:'rgba(255,255,255,0.04)',border:'2px solid rgba(255,255,255,0.06)'}}/><span style={{color:MUTED,fontSize:'12px'}}>Available</span></div>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}><div style={{width:'24px',height:'14px',borderRadius:'3px',backgroundColor:'rgba(249,115,22,0.12)',border:'2px solid rgba(249,115,22,0.3)'}}/><span style={{color:MUTED,fontSize:'12px'}}>Rush hour</span></div>
        <div style={{marginLeft:'auto',display:'flex',gap:'10px'}}>
          {SHIFTS.map(s=><div key={s.key} style={{display:'flex',alignItems:'center',gap:'5px'}}><div style={{width:'24px',height:'4px',borderRadius:'2px',backgroundColor:s.color+'70'}}/><span style={{color:MUTED,fontSize:'11px',fontWeight:600}}>{s.key} {fmtH(s.start)}–{fmtH(s.end)}</span></div>)}
        </div>
      </div>

      {DAYS.map((dayName,dayIndex)=>{
        const date=addDays(monday,dayIndex)
        const dateStr=format(date,'yyyy-MM-dd')
        const isWeekend=WEEKEND.includes(dayIndex)
        const dayBlocked=HOURS.filter(h=>blocked[dayIndex+'_'+h]).length
        return(
          <div key={dayName} style={{backgroundColor:CARD,borderRadius:'14px',border:isWeekend?'1px solid rgba(255,99,87,0.2)':`1px solid ${BORDER}`,overflow:'hidden'}}>
            <div style={{padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',backgroundColor:isWeekend?'rgba(255,99,87,0.08)':'rgba(255,255,255,0.03)',borderBottom:`1px solid ${BORDER}`}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <p style={{color:CREAM,fontSize:'14px',fontWeight:700}}>{dayName}</p>
                <p style={{color:MUTED,fontSize:'11px'}}>{format(date,'MMM d')}</p>
                {isWeekend&&<span style={{backgroundColor:'rgba(255,99,87,0.2)',color:CORAL,fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'20px'}}>Mandatory</span>}
              </div>
              <span style={{color:dayBlocked>0?'#ef4444':'#22c55e',fontSize:'11px',fontWeight:600}}>{dayBlocked>0?dayBlocked+'h blocked':'All available'}</span>
            </div>
            <div style={{padding:'10px 14px'}}>
              <div style={{position:'relative',height:'5px',marginBottom:'5px'}}>
                {SHIFTS.map(s=><div key={s.key} style={{position:'absolute',height:'100%',borderRadius:'2px',backgroundColor:s.color+'50',left:((s.start-8)/16*100)+'%',width:((Math.min(s.end,24)-s.start)/16*100)+'%'}}/>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(16,1fr)',gap:'2px'}}>
                {HOURS.map(h=>{
                  const isBlocked=blocked[dayIndex+'_'+h]
                  const isRush=!isWeekend&&h>=rushStart&&h<rushEnd
                  return(
                    <div key={h} style={{position:'relative'}}>
                      <button onClick={()=>toggleHour(dayIndex,h)} title={fmtH(h)+(isBlocked?' — blocked':' — available')} style={{width:'100%',height:'30px',borderRadius:'3px',border:'none',cursor:'pointer',backgroundColor:isBlocked?'rgba(239,68,68,0.35)':isRush?'rgba(249,115,22,0.12)':'rgba(255,255,255,0.04)',borderTop:isBlocked?'2px solid rgba(239,68,68,0.6)':isRush?'2px solid rgba(249,115,22,0.3)':'2px solid rgba(255,255,255,0.06)',transition:'all 0.1s'}}/>
                      <span style={{position:'absolute',bottom:'-13px',left:'50%',transform:'translateX(-50%)',color:'rgba(247,240,232,0.25)',fontSize:'7px',fontWeight:600,whiteSpace:'nowrap',pointerEvents:'none'}}>{fmtH(h)}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{height:'16px'}}/>
            </div>
          </div>
        )
      })}

      <div style={{backgroundColor:CARD,borderRadius:'16px',border:`1px solid ${BORDER}`,padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px'}}>
        <div>
          <p style={{color:CREAM,fontSize:'14px',fontWeight:700}}>{blockedCount>0?blockedCount+' hours blocked':'All hours available this week'}</p>
          <p style={{color:MUTED,fontSize:'12px',marginTop:'2px'}}>Tap any hour to block it. Everything else is available for scheduling.</p>
          {savedMsg&&<p style={{color:'#22c55e',fontSize:'12px',fontWeight:600,marginTop:'4px'}}>{savedMsg}</p>}
        </div>
        {submitted?(
          <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'12px',backgroundColor:'rgba(34,197,94,0.15)',color:'#22c55e',fontSize:'13px',fontWeight:700,flexShrink:0}}><Check size={14}/> Submitted</div>
        ):(
          <button onClick={submitWeek} disabled={saving} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'12px',backgroundColor:CORAL,color:'white',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,boxShadow:'0 2px 12px rgba(255,99,87,0.4)',opacity:saving?0.6:1}}>
            <Send size={13}/>{saving?'Submitting...':'Submit Availability'}
          </button>
        )}
      </div>
    </div>
  )
}