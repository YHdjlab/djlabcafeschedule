import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, style, ...props }, ref) => (
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      {label && <label style={{color:'rgba(247,240,232,0.5)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>}
      <input ref={ref}
        style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',backgroundColor:'#2e2e2e',color:'#F7F0E8',fontSize:'14px',outline:'none',...style}}
        {...props}/>
      {error && <p style={{color:'#ef4444',fontSize:'12px',fontWeight:500}}>{error}</p>}
      {hint && !error && <p style={{color:'rgba(247,240,232,0.3)',fontSize:'12px'}}>{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'
