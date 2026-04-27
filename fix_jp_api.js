const https = require("https");

// Use Supabase Management API to run SQL directly
const sql = `
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('gm', 'admin', 'supervisor_floor', 'supervisor_bar', 'floor', 'bar'));
UPDATE profiles SET role = 'admin' WHERE email = 'hoyekjp@gmail.com';
`;

const data = JSON.stringify({ query: sql });
const options = {
  hostname: "gxmdtemgiuvahlcaobrr.supabase.co",
  path: "/rest/v1/rpc/exec_sql",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  }
};

const req = https.request(options, res => {
  let body = "";
  res.on("data", d => body += d);
  res.on("end", () => console.log("Response:", body));
});
req.on("error", e => console.log("Error:", e));
req.write(data);
req.end();
