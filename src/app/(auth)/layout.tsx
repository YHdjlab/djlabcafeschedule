export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#1e1e1e', backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(255,99,87,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(50,50,50,0.8) 0%, transparent 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
      <div style={{width: '100%', maxWidth: '400px'}}>
        <div style={{textAlign: 'center', marginBottom: '36px'}}>
          <div style={{backgroundColor: '#323232', borderRadius: '24px', padding: '20px 36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(247,240,232,0.08)'}}>
            <img src="/images/logo.png" alt="DjLab Cafe" style={{height: '44px', width: 'auto'}}/>
          </div>
          <p style={{color: 'rgba(247,240,232,0.25)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '600'}}>Schedule Management</p>
        </div>
        {children}
      </div>
    </div>
  )
}
