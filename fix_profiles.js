const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fix() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  console.log("Auth users:", users.map(u => u.email));

  const staffMap = {
    "garo@djlab.xyz":              { full_name: "Garo Gdanian", role: "gm",               phone: "+9613783267",  is_admin: true  },
    "hoyekjp@gmail.com":           { full_name: "JP",            role: "supervisor_floor", phone: "+96176080104", is_admin: true  },
    "miladaali995@gmail.com":      { full_name: "Miled",         role: "supervisor_bar",   phone: "+9613595802",  is_admin: false },
    "cloyounan@gmail.com":         { full_name: "Cleo",          role: "floor",            phone: "+96170527754", is_admin: false },
    "roubakazzaz@gmail.com":       { full_name: "Rouba",         role: "floor",            phone: "+96170032447", is_admin: false },
    "ndflucy@gmail.com":           { full_name: "Lucciana",      role: "bar",              phone: "+96170408723", is_admin: false },
    "cynthiaboughanem1@gmail.com": { full_name: "Cynthia",       role: "bar",              phone: "+96176081727", is_admin: false },
    "youssef@djlab.xyz":           { full_name: "Youssef",       role: "gm",               phone: "+96176393312", is_admin: true  },
  };

  const { data: profiles } = await supabase.from("profiles").select("id,email");
  const existingIds = new Set(profiles.map(p => p.id));

  for (const user of users) {
    const info = staffMap[user.email?.toLowerCase()];
    if (!info) { console.log("No mapping for:", user.email); continue; }
    if (existingIds.has(user.id)) {
      const { error } = await supabase.from("profiles").update({ role: info.role, full_name: info.full_name, phone: info.phone, active: true, is_admin: info.is_admin }).eq("id", user.id);
      console.log("Updated:", user.email, "->", info.role, "is_admin:", info.is_admin, error?.message || "OK");
    } else {
      const { error } = await supabase.from("profiles").insert({ id: user.id, email: user.email, full_name: info.full_name, role: info.role, phone: info.phone, active: true, is_admin: info.is_admin });
      console.log("Inserted:", user.email, "->", info.role, "is_admin:", info.is_admin, error?.message || "OK");
    }
  }
}
fix();
