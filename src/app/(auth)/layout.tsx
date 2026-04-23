export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
      <div style={{width:'100%', maxWidth:'420px'}}>
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <div style={{backgroundColor:'#323232', borderRadius:'20px', padding:'20px 32px', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:'16px', border:'1px solid rgba(255,255,255,0.1)'}}>
            <img src="/images/logo.png" alt="DjLab Cafe" style={{height:'48px', width:'auto'}}/>
          </div>
          <p style={{color:'rgba(255,255,255,0.4)', fontSize:'13px', letterSpacing:'0.05em'}}>SCHEDULE MANAGEMENT</p>
        </div>
        {children}
      </div>
    </div>
  )
}