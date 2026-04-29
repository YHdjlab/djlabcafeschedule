const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DATES=["2026-05-04","2026-05-05","2026-05-06","2026-05-07","2026-05-08","2026-05-09","2026-05-10"];
const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const HOURS=Array.from({length:16},(_,i)=>i+8);
const WEEK="2026-05-04";
function range(s,e){const r=[];for(let i=s;i<e;i++)r.push(i);return r;}
function fmtH(h){if(h<12)return h+" AM";if(h===12)return "12 PM";return(h-12)+" PM";}

const emailBlocks={
  "cloyounan@gmail.com":        {0:range(8,20),1:[],2:[],3:range(8,16),4:range(8,20),5:range(8,20),6:[]},
  "roubakazzaz@gmail.com":      {0:range(11,24),1:range(17,24),2:range(17,24),3:range(14,24),4:range(14,24),5:range(8,16),6:range(8,16)},
  "ndflucy@gmail.com":          {0:range(8,15),1:range(8,15),2:range(8,15),3:range(8,15),4:range(8,15),5:[],6:[]},
  "cynthiaboughanem1@gmail.com":{0:[],1:range(18,21),2:range(15,21),3:[],4:[],5:[],6:[]},
  "hoyekjp@gmail.com":          {0:range(11,17),1:[],2:[],3:range(15,17),4:[],5:[],6:[]},
  "miladaali995@gmail.com":     {0:[],1:[],2:[],3:[],4:[],5:[],6:[]},
};

async function main(){
  // Fix JP role
  const {error:e1}=await supabase.from("profiles").update({role:"supervisor"}).eq("id","154bdb74-28ef-4cfd-9b22-b8d531b4ff98");
  console.log("JP role fix:", e1?e1.message:"OK");
  const {error:e2}=await supabase.from("profiles").update({role:"supervisor"}).eq("id","968e9720-6554-4cff-96aa-2cefe6993b84");
  console.log("Miled role fix:", e2?e2.message:"OK");

  // Verify all profiles
  const {data:profiles}=await supabase.from("profiles").select("id,email,full_name,role");
  console.log("\nProfiles:");
  profiles?.forEach(p=>console.log(" ",p.full_name,p.role));

  // Clear and reseed with correct IDs
  await supabase.from("availability").delete().eq("week_starting",WEEK);
  console.log("\nCleared availability");

  let total=0;
  for(const [email,blocks] of Object.entries(emailBlocks)){
    const profile=profiles?.find(p=>p.email===email);
    if(!profile){console.log("NOT FOUND:",email);continue;}
    const rows=[];
    for(let d=0;d<7;d++){
      const dateStr=DATES[d];
      const blockedHours=new Set(blocks[d]||[]);
      for(const h of HOURS){
        rows.push({week_starting:WEEK,staff_id:profile.id,slot_key:dateStr+"_h"+h,slot_label:DAYS[d]+" "+fmtH(h),slot_date:dateStr,available:!blockedHours.has(h)});
      }
    }
    const{error}=await supabase.from("availability").upsert(rows,{onConflict:"week_starting,staff_id,slot_key"});
    if(error)console.log("ERROR",email,error.message);
    else console.log("Seeded",profile.full_name+"("+profile.role+"):",Object.values(blocks).flat().length,"blocked hours");
    total+=rows.length;
  }
  console.log("\nTotal:",total,"slots");

  // Verify
  const{data:check}=await supabase.from("availability").select("staff_id").eq("week_starting",WEEK).eq("available",true).limit(200);
  const ids=[...new Set(check?.map(a=>a.staff_id))];
  console.log("\nAvailability staff IDs:",ids.length);
  ids.forEach(id=>{const p=profiles?.find(p=>p.id===id);console.log(" ",p?.full_name,"("+p?.role+")")});
}
main();
