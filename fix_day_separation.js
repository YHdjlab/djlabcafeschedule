const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Add more visual separation between days - gap and subtle glow
ap = ap.replace(
  `        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {generatedSlots.map((slot: any) => {`,
  `        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {generatedSlots.map((slot: any) => {`
);

// Make each day card more distinct with a stronger border and shadow
ap = ap.replace(
  `              <div key={slot.key} style={{ borderRadius: '16px', border: slot.issues?.length ? '1px solid rgba(239,68,68,0.3)' : \`1px solid \${BORDER}\`, overflow: 'hidden' }}>`,
  `              <div key={slot.key} style={{ borderRadius: '16px', border: slot.issues?.length ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', boxShadow: slot.issues?.length ? '0 4px 24px rgba(239,68,68,0.1)' : '0 4px 24px rgba(0,0,0,0.3)' }}>`
);

// Make day header bolder and more distinct
ap = ap.replace(
  `                <div style={{ padding: '14px 18px', backgroundColor: slot.issues?.length ? '#3B0A0A' : '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>`,
  `                <div style={{ padding: '16px 20px', background: slot.issues?.length ? 'linear-gradient(135deg, #3B0A0A, #2a0a0a)' : slot.isWeekend ? 'linear-gradient(135deg, #2a1a0a, #1e1e1e)' : 'linear-gradient(135deg, #2a2a2a, #1e1e1e)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>`
);

// Bigger day name
ap = ap.replace(
  `                      <p style={{ color: CREAM, fontSize: '17px', fontWeight: 800, lineHeight: 1 }}>{slot.day}</p>`,
  `                      <p style={{ color: CREAM, fontSize: '20px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>{slot.day}</p>`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
