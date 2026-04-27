const fs = require("fs");
let sv = fs.readFileSync("src/components/schedule/schedule-view.tsx", "utf8");

// Fix fmtH and timeToH to handle "HH:MM:SS" format
sv = sv.replace(
  `  const fmtH = (t: string) => {
    if (!t) return ''
    if (t === '00:00') return '12am'
    const h = parseInt(t.split(':')[0])
    if (h === 0) return '12am'
    if (h < 12) return h + 'am'
    if (h === 12) return '12pm'
    return (h - 12) + 'pm'
  }

  const timeToH = (t: string) => {
    if (!t || t === '00:00') return 24
    return parseInt(t.split(':')[0])
  }`,
  `  const fmtH = (t: string) => {
    if (!t) return ''
    const h = parseInt(t.split(':')[0])
    if (h === 0) return '12am'
    if (h < 12) return h + 'am'
    if (h === 12) return '12pm'
    return (h - 12) + 'pm'
  }

  const timeToH = (t: string) => {
    if (!t) return 24
    const h = parseInt(t.split(':')[0])
    if (h === 0) return 24
    return h
  }`
);

fs.writeFileSync("src/components/schedule/schedule-view.tsx", sv, "utf8");
console.log("done");
