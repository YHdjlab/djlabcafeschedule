import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; options?: {value:string;label:string}[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, ...props }, ref) => (
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      {label && <label style={{color:'rgba(247,240,232,0.5)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>}
      <select ref={ref} style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:error?'1px solid #ef4444':'1px solid rgba(255,255,255,0.1)',backgroundColor:'#2e2e2e',color:'#F7F0E8',fontSize:'14px',cursor:'pointer'}} className={className} {...props}>
        {options ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>) : children}
      </select>
      {error && <p style={{color:'#ef4444',fontSize:'12px'}}>{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
