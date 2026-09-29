import fs from "node:fs/promises";
const cfg=JSON.parse(await fs.readFile("automation/pool-config.json","utf8"));
const url="https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv";
const res=await fetch(url); if(!res.ok) throw new Error(`NFL data fetch failed: ${res.status}`);
const raw=await res.text();
function csv(line){let a=[],s="",q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c=='"'){if(q&&line[i+1]=='"'){s+='"';i++;}else q=!q;}else if(c===","&&!q){a.push(s);s="";}else s+=c;}a.push(s);return a;}
const lines=raw.trim().split(/\r?\n/),h=csv(lines.shift());
const rows=lines.map(x=>{const v=csv(x),o={};h.forEach((k,i)=>o[k]=v[i]);return o;}).filter(g=>+g.season===cfg.season&&g.game_type==="REG");
const done=rows.filter(g=>g.away_score!==""&&g.home_score!=="");
const completedWeeks=[...new Set(done.map(g=>+g.week))].sort((a,b)=>a-b), throughWeek=completedWeeks.at(-1)||0;
const team={}; for(const g of done){for(const t of [g.away_team,g.home_team]) team[t]??={w:0,l:0,t:0,g:0}; const a=+g.away_score,b=+g.home_score;team[g.away_team].g++;team[g.home_team].g++;if(a>b){team[g.away_team].w++;team[g.home_team].l++;}else if(b>a){team[g.home_team].w++;team[g.away_team].l++;}else{team[g.away_team].t++;team[g.home_team].t++;}}
function resultFor(g,t){const a=+g.away_score,b=+g.home_score,tw=g.away_team===t?a:b,ow=g.away_team===t?b:a;return tw>ow?"W":tw<ow?"L":"T";}
const weekly={}; const perfectWeeks=[];
for(const [name,teams] of Object.entries(cfg.players)){weekly[name]={};for(const w of completedWeeks){const wr={w:0,l:0,t:0};for(const t of teams){const g=done.find(x=>+x.week===w&&(x.away_team===t||x.home_team===t));if(!g)continue;const r=resultFor(g,t);wr[r.toLowerCase()]++;}weekly[name][w]=wr;if(wr.w===3)perfectWeeks.push({player:name,week:w});}}
const players=Object.entries(cfg.players).map(([name,teams])=>{const rec=teams.map(code=>({code,...(team[code]||{w:0,l:0,t:0,g:0})}));return{name,teams:rec,wins:rec.reduce((n,r)=>n+r.w,0),games:rec.reduce((n,r)=>n+r.g,0),worstTeamWins:Math.min(...rec.map(r=>r.w)),weekly:weekly[name],recent:weekly[name][throughWeek]||{w:0,l:0,t:0},perfect:perfectWeeks.filter(x=>x.player===name).length};});
players.sort((a,b)=>b.wins-a.wins||b.worstTeamWins-a.worstTeamWins);
const nextWeek=Math.min(18,throughWeek+1);
const upcoming=rows.filter(g=>+g.week===nextWeek).map(g=>({week:+g.week,gameday:g.gameday,gametime:g.gametime,away:g.away_team,home:g.home_team}));
const semantic={season:cfg.season,throughWeek,nextWeek,players,perfectWeeks,undrafted:cfg.undrafted.map(code=>({code,...(team[code]||{w:0,l:0,t:0,g:0})})),upcoming};
await fs.mkdir("generated",{recursive:true});
let previous=null;try{previous=JSON.parse(await fs.readFile("generated/current.json","utf8"));}catch{}
const previousSemantic=previous&&Object.fromEntries(Object.entries(previous).filter(([k])=>k!=="generatedAt"));
if(previousSemantic&&JSON.stringify(previousSemantic)===JSON.stringify(semantic)){console.log("No NFL data changes; generated file left untouched.");process.exit(0);}
const out={generatedAt:new Date().toISOString(),...semantic};
await fs.writeFile("generated/current.json",JSON.stringify(out,null,2)+"\n");console.log(`Generated through Week ${throughWeek}; next Week ${nextWeek}`);