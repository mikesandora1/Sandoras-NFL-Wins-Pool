import fs from "node:fs/promises";
const d=JSON.parse(await fs.readFile("generated/current.json","utf8"));
if(d.throughWeek < 3) throw new Error("Source has not reached Week 3.");
const expected={Lou:[7,2,1],Andy:[7,2,1],Brian:[6,2,1],Sandora:[6,3,0],Jay:[5,2,1],Nate:[4,1,2],Shaffer:[4,2,1],Tommy:[3,0,3],Pete:[3,1,2],Mullane:[2,1,2]};
let bad=[];
for(const [name,[wins,w,l]] of Object.entries(expected)){
 const p=d.players.find(x=>x.name===name);
 if(!p||p.wins!==wins||p.weekly.w!==w||p.weekly.l!==l) bad.push({name,expected:{wins,w,l},actual:p});
}
const u=Object.fromEntries(d.undrafted.map(x=>[x.code,x]));
if(u.MIA?.w!==0||u.MIA?.l!==3||u.ARI?.w!==1||u.ARI?.l!==2) bad.push({undrafted:d.undrafted});
if(bad.length){console.error(JSON.stringify(bad,null,2));process.exit(1);}
console.log("Week 3 baseline validated.");
