import fs from "node:fs/promises";
const d=JSON.parse(await fs.readFile("generated/current.json","utf8"));
if(d.throughWeek<3) throw new Error("Source has not reached Week 3.");
const expected={Lou:[7,2,1],Andy:[7,2,1],Brian:[6,2,1],Sandora:[6,3,0],Jay:[5,2,1],Nate:[4,1,2],Shaffer:[4,2,1],Tommy:[3,0,3],Pete:[3,1,2],Mullane:[2,1,2]};
let bad=[];
for(const [name,[wins3,w,l]] of Object.entries(expected)){const p=d.players.find(x=>x.name===name),r=p?.weekly?.["3"];const cum=Object.entries(p?.weekly||{}).filter(([wk])=>+wk<=3).reduce((n,[,x])=>n+x.w,0);if(!p||cum!==wins3||r?.w!==w||r?.l!==l)bad.push({name,expected:{wins3,w,l},actual:{cum,week3:r}});}
const brian2=d.players.find(x=>x.name==="Brian")?.weekly?.["2"];
if(brian2?.w!==3)bad.push({name:"Brian",expected:"3-0 Week 2",actual:brian2});
if(bad.length){console.error(JSON.stringify(bad,null,2));process.exit(1);}console.log("Known Week 3 baseline validated, including Brian's 3-0 Week 2.");