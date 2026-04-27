const https = require("https");

async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const options = {
      hostname: "api.supabase.com",
      path: "/v1/projects/gxmdtemgiuvahlcaobrr/database/query",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sbp_b091296166042eb5bc4e7fada7bfb81737dd8970",
        "Content-Length": Buffer.byteLength(data)
      }
    };
    const req = https.request(options, res => {
      let body = "";
      res.on("data", d => body += d);
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  let r;
  r = await runSQL("ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check");
  console.log("Drop constraint:", r.status, r.body);
  
  r = await runSQL("ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('gm', 'admin', 'supervisor_floor', 'supervisor_bar', 'floor', 'bar'))");
  console.log("Add constraint:", r.status, r.body);
  
  r = await runSQL("UPDATE profiles SET role = 'admin' WHERE email = 'hoyekjp@gmail.com'");
  console.log("Update JP:", r.status, r.body);
  
  r = await runSQL("SELECT email, role FROM profiles WHERE email = 'hoyekjp@gmail.com'");
  console.log("Verify:", r.status, r.body);
}
main();
