import fs from "node:fs/promises";
const d=JSON.parse(await fs.readFile("generated/current.json","utf8"));
if(d.throughWeek<3) throw new Error("Source has not reached Week 3.");
const expected={Lou:[7,2,1],Andy:[7,2,1],Brian:[6,2,1],Sandora:[6,3,0],Jay:[5,2,1],Nate:[4,1,2],Shaffer:[4,2,1],Tommy:[3,0,3],Pete:[3,1,2],Mullane:[2,1,2]};
let bad=[];
for(const [name,[week3Wins,w,l]] of Object.entries(expected)){const p=d.players.find(x=>x.name===name),r=p?.weekly?.["3"];const cumulativeThrough3=Object.entries(p?.weekly||{}).filter(([wk])=>+wk<=3).reduce((n,[,x])=>n+x.w,0);if(!p||cumulativeThrough3!==week3Wins||r?.w!==w||r?.l!==l)bad.push({name,expected:{week3Wins,w,l},actual:{cumulativeThrough3,week3:r}});}
if(bad.length){console.error(JSON.stringify(bad,null,2));process.exit(1);}console.log("Known Week 3 baseline validated.");