const https = require("https");
function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const options = {
      hostname: "api.supabase.com",
      path: "/v1/projects/gxmdtemgiuvahlcaobrr/database/query",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer sbp_b091296166042eb5bc4e7fada7bfb81737dd8970", "Content-Length": Buffer.byteLength(data) }
    };
    const req = https.request(options, res => { let b = ""; res.on("data", d => b += d); res.on("end", () => resolve(b)); });
    req.on("error", reject); req.write(data); req.end();
  });
}
async function main() {
  let r = await runSQL("UPDATE profiles SET role = 'supervisor_floor' WHERE email = 'hoyekjp@gmail.com'");
  console.log("JP -> supervisor_floor:", r);
  r = await runSQL("SELECT email, role FROM profiles ORDER BY role");
  console.log("All profiles:", r);
}
main();
