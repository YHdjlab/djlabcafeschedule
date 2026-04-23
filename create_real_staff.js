const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const staff = [
  { email: "garo@djlab.xyz",              password: "djlab2026", fullName: "Garo Gdanian", role: "gm",               phone: "+9613783267"  },
  { email: "hoyekjp@gmail.com",           password: "djlab2026", fullName: "JP",            role: "supervisor_floor", phone: "+96176080104" },
  { email: "Miladaali995@gmail.com",      password: "djlab2026", fullName: "Miled",          role: "supervisor_bar",   phone: "+9613595802"  },
  { email: "cloyounan@gmail.com",         password: "djlab2026", fullName: "Cleo",           role: "floor",            phone: "+96170527754" },
  { email: "Roubakazzaz@gmail.com",       password: "djlab2026", fullName: "Rouba",          role: "floor",            phone: "+96170032447" },
  { email: "ndflucy@gmail.com",           password: "djlab2026", fullName: "Lucciana",       role: "bar",              phone: "+96170408723" },
  { email: "Cynthiaboughanem1@gmail.com", password: "djlab2026", fullName: "Cynthia",        role: "bar",              phone: "+96176081727" },
];

async function createAll() {
  for (const s of staff) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: s.email.toLowerCase(), password: s.password, email_confirm: true,
      user_metadata: { full_name: s.fullName, role: s.role, phone: s.phone }
    });
    if (error) console.log("FAILED " + s.email + ": " + error.message);
    else console.log("Created: " + s.email + " -> " + s.fullName + " (" + s.role + ")");
  }
  console.log("Done. All passwords: djlab2026");
}
createAll();
