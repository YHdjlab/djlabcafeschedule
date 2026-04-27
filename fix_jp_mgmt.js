const https = require("https");

const sql = "ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check; ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (''gm'', ''admin'', ''supervisor_floor'', ''supervisor_bar'', ''floor'', ''bar'')); UPDATE profiles SET role = ''admin'' WHERE email = ''hoyekjp@gmail.com'';";

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
  res.on("end", () => console.log("Response:", res.statusCode, body));
});
req.on("error", e => console.log("Error:", e.message));
req.write(data);
req.end();
