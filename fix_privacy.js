const fs = require("fs");

// Fix schedule view - for non-admin, only show the days they work
// and hide other staff names/bars (show only their own row)
let sv = fs.readFileSync("src/components/schedule/schedule-view.tsx", "utf8");

// Filter staff list for non-admins - only show themselves
sv = sv.replace(
  `  const getStaff = (slot: any) => [
    slot.supervisor && { ...slot.supervisor, role: 'Supervisor', isMe: slot.supervisor_id === profile.id, color: '#3B82F6' },
    slot.bar_staff && { ...slot.bar_staff, role: 'Bar', isMe: slot.bar_staff_id === profile.id, color: '#A855F7' },
    slot.floor_staff1 && { ...slot.floor_staff1, role: 'Floor', isMe: slot.floor_staff1_id === profile.id, color: '#22C55E' },
    slot.floor_staff2 && { ...slot.floor_staff2, role: 'Floor', isMe: slot.floor_staff2_id === profile.id, color: '#22C55E' },
  ].filter(Boolean)`,
  `  const getStaff = (slot: any) => {
    const all = [
      slot.supervisor && { ...slot.supervisor, role: 'Supervisor', isMe: slot.supervisor_id === profile.id, color: '#3B82F6' },
      slot.bar_staff && { ...slot.bar_staff, role: 'Bar', isMe: slot.bar_staff_id === profile.id, color: '#A855F7' },
      slot.floor_staff1 && { ...slot.floor_staff1, role: 'Floor', isMe: slot.floor_staff1_id === profile.id, color: '#22C55E' },
      slot.floor_staff2 && { ...slot.floor_staff2, role: 'Floor', isMe: slot.floor_staff2_id === profile.id, color: '#22C55E' },
    ].filter(Boolean)
    // Non-admin staff only see themselves
    if (!isAdmin) return all.filter((s: any) => s.isMe)
    return all
  }`
);

fs.writeFileSync("src/components/schedule/schedule-view.tsx", sv, "utf8");
console.log("schedule-view fixed - staff only see themselves");
