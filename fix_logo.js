const fs = require("fs");
let sidebar = fs.readFileSync("src/components/layout/sidebar.tsx", "utf8");
sidebar = sidebar.replace(
  `<div className="p-5 border-b border-black/5" style={{backgroundColor: '#323232'}}>
        <img src="/images/logo.png" alt="DjLab Cafe" style={{height: '40px', width: 'auto'}}/>
      </div>`,
  `<div style={{backgroundColor: '#323232', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
        <img src="/images/logo.png" alt="DjLab Cafe" style={{height: '44px', width: 'auto', objectFit: 'contain'}}/>
      </div>`
);
fs.writeFileSync("src/components/layout/sidebar.tsx", sidebar, "utf8");
console.log("done");
