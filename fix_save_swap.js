const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix 1: Swap - look up actual hours for new person instead of setting info: null
ap = ap.replace(
  `                              const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, id: newId, info: null } : m)`,
  `                              const newHours = weekAvailability
                                .filter((a: any) => a.staff_id === newId && a.slot_date === gs.date)
                                .map((a: any) => { const match = a.slot_key.match(/_h(\\d+)$/); return match ? parseInt(match[1]) : -1 })
                                .filter((h: number) => h >= 0)
                                .sort((a: number, b: number) => a - b)
                              const newInfo = newHours.length ? { startH: newHours[0], endH: newHours[newHours.length-1]+1, totalH: newHours[newHours.length-1]+1-newHours[0], hours: newHours } : null
                              const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, id: newId, info: newInfo } : m)`
);

// Fix 2: Save & Submit - if GM, auto-approve immediately after saving
ap = ap.replace(
  `    await supabase.from('schedules').delete().eq('week_starting', weekStart).eq('status', 'draft')
    const { data } = await supabase.from('schedules').insert(rows).select('*, supervisor:supervisor_id(id,full_name), bar_staff:bar_staff_id(id,full_name), floor_staff1:floor_staff1_id(id,full_name), floor_staff2:floor_staff2_id(id,full_name)')
    if (data) {
      setSchedules((prev: any[]) => [...prev.filter(s => s.week_starting !== weekStart), ...data])
      setGeneratedSlots([])
    }
    setSaving(false)`,
  `    await supabase.from('schedules').delete().eq('week_starting', weekStart)
    const { data } = await supabase.from('schedules').insert(rows).select('*, supervisor:supervisor_id(id,full_name), bar_staff:bar_staff_id(id,full_name), floor_staff1:floor_staff1_id(id,full_name), floor_staff2:floor_staff2_id(id,full_name)')
    if (data) {
      // If GM or admin - auto approve immediately
      if (['gm','admin'].includes(profile.role)) {
        await supabase.from('schedules').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: profile.id }).eq('week_starting', weekStart)
        const approved = data.map((s: any) => ({ ...s, status: 'approved' }))
        setSchedules((prev: any[]) => [...prev.filter((s: any) => s.week_starting !== weekStart), ...approved])
      } else {
        setSchedules((prev: any[]) => [...prev.filter((s: any) => s.week_starting !== weekStart), ...data])
      }
      setGeneratedSlots([])
    }
    setSaving(false)`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
