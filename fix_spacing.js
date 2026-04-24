const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix the preview header - save button getting cut
ap = ap.replace(
  `<div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4">`,
  `<div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center justify-between gap-6">`
);

// More padding on staff cards
ap = ap.replace(
  `<div key={member.id} className={cn("rounded-2xl border p-3 flex flex-col gap-2", roleBg)}>`,
  `<div key={member.id} className={cn("rounded-2xl border p-4 flex flex-col gap-3", roleBg)}>`
);

// More padding on staff grid
ap = ap.replace(
  `<div className="p-4 grid grid-cols-2 gap-3">`,
  `<div className="p-5 grid grid-cols-2 gap-4">`
);

// More padding on day header
ap = ap.replace(
  `<div className={cn('px-5 py-4 flex items-center justify-between', slot.issues?.length ? 'bg-red-50' : isWeekend ? 'bg-[#323232]' : 'bg-[#323232]')}>`,
  `<div className={cn('px-6 py-5 flex items-center justify-between', slot.issues?.length ? 'bg-red-800' : 'bg-[#323232]')}>`
);

// More padding on rush band
ap = ap.replace(
  `<div className="px-5 py-2 bg-white border-b border-black/5 flex items-center gap-3">`,
  `<div className="px-6 py-3 bg-white border-b border-black/5 flex items-center gap-4">`
);

// More padding on issues
ap = ap.replace(
  `<div className="mx-4 mb-4 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">`,
  `<div className="mx-5 mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2">`
);

// Fix the week nav card padding
ap = ap.replace(
  `<Card padding="sm">
        <div className="flex items-center justify-between p-2">`,
  `<Card padding="sm">
        <div className="flex items-center justify-between p-3">`
);

// Make space between day cards
ap = ap.replace(
  `<div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center justify-between gap-6">`,
  `<div className="space-y-5">
          <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center justify-between gap-6">`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
