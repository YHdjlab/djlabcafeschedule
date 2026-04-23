const fs = require("fs");
let grid = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");

// Replace the legend+submit bar with a cleaner sticky version
grid = grid.replace(
  `      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"/><span className="text-gray-500">Rush</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-50 border border-blue-100"/><span className="text-gray-500">Off-rush</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-400"/><span className="text-gray-500">Available</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#FF6357]"/><span className="text-gray-500">Scheduled</span></div>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-xs text-green-600 font-medium">{savedMsg}</span>}
          {isSubmitted ? (
            <span className="text-xs px-3 py-1.5 rounded-xl bg-green-100 text-green-700 font-semibold flex items-center gap-1">
              <Check size={12}/> Submitted
            </span>
          ) : (
            <button onClick={submitWeek} disabled={submitting || totalHours === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6357] text-white text-sm font-semibold hover:bg-[#e5554a] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={13}/>
              {submitting ? 'Submitting...' : 'Submit Availability'}
            </button>
          )}
        </div>
      </div>`,
  `      <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"/><span className="text-gray-500">Rush hour</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-50 border border-blue-100"/><span className="text-gray-500">Off-rush</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-400"/><span className="text-gray-500">Available</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#FF6357]"/><span className="text-gray-500">Scheduled shift</span></div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {savedMsg && <span className="text-xs text-green-600 font-semibold">{savedMsg}</span>}
          <span className="text-sm font-medium text-gray-500">{totalHours}h selected</span>
          {isSubmitted ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-semibold">
              <Check size={14}/> Submitted
            </span>
          ) : (
            <button onClick={submitWeek} disabled={submitting || totalHours === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF6357] text-white text-sm font-semibold hover:bg-[#e5554a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
              <Send size={14}/>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>`
);

fs.writeFileSync("src/components/schedule/availability-grid.tsx", grid, "utf8");
console.log("Done");
