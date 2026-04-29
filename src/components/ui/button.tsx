import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: { backgroundColor: '#FF6357', color: 'white', boxShadow: '0 2px 8px rgba(255,99,87,0.3)' },
  secondary: { backgroundColor: '#2e2e2e', color: '#F7F0E8', border: '1px solid rgba(255,255,255,0.1)' },
  ghost: { backgroundColor: 'transparent', color: 'rgba(247,240,232,0.6)' },
  danger: { backgroundColor: '#ef4444', color: 'white' },
  outline: { backgroundColor: 'transparent', color: 'rgba(247,240,232,0.7)', border: '1px solid rgba(255,255,255,0.12)' },
}

const sizes = {
  sm: { padding: '6px 14px', fontSize: '12px', gap: '4px' },
  md: { padding: '9px 18px', fontSize: '13px', gap: '6px' },
  lg: { padding: '12px 24px', fontSize: '14px', gap: '8px' },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, style, ...props }, ref) => (
    <button ref={ref} disabled={disabled || loading}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        borderRadius:'10px', border:'none', cursor: disabled||loading ? 'not-allowed' : 'pointer',
        fontWeight:600, whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s',
        opacity: disabled||loading ? 0.4 : 1,
        ...variants[variant], ...sizes[size], ...style
      }}
      className={className} {...props}>
      {loading ? (
        <span style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <svg style={{animation:'spin 1s linear infinite',width:'14px',height:'14px'}} fill="none" viewBox="0 0 24 24">
            <circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path style={{opacity:0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>Loading...
        </span>
      ) : children}
    </button>
  )
)
Button.displayName = 'Button'
