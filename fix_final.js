const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// 1. Add Eye to imports
ap = ap.replace(
  "import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'",
  "import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle, Eye } from 'lucide-react'"
);

// 2. Fix corrupted bullet character Â·
ap = ap.replace(/Â·/g, "-");

// 3. Fix swap display - ? should be +
ap = ap.replace(
  "{swap.staff_a?.full_name} ? {swap.staff_b?.full_name}",
  "{swap.staff_a?.full_name} + {swap.staff_b?.full_name}"
);

// 4. Fix the preview header to be more premium
ap = ap.replace(
  `          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#323232]">Schedule Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Based on actual availability. Swap staff using dropdowns.</p>
            </div>
            <button onClick={saveSchedule} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF6357] text-white text-sm font-semibold hover:bg-[#e5554a] transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save and Submit'}
            </button>
          </div>`,
  `          <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#323232]">Schedule Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Auto-assigned by least hours. Use Swap dropdowns to override.</p>
            </div>
            <button onClick={saveSchedule} disabled={saving}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] transition-all disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save and Submit'}
            </button>
          </div>`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
