import fs from "node:fs/promises";
const cfg=JSON.parse(await fs.readFile("automation/pool-config.json","utf8"));
const url="https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv";
const raw=await (await fetch(url)).text();
function csv(line){let a=[],s="",q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c=='"'){if(q&&line[i+1]=='"'){s+='"';i++;}else q=!q;}else if(c==","&&!q){a.push(s);s="";}else s+=c;}a.push(s);return a;}
const lines=raw.trim().split(/\r?\n/), h=csv(lines.shift());
const rows=lines.map(x=>{const v=csv(x),o={};h.forEach((k,i)=>o[k]=v[i]);return o;})
 .filter(g=>+g.season===cfg.season&&g.game_type==="REG");
const done=rows.filter(g=>g.away_score!==""&&g.home_score!=="");
const team={};
for(const g of done){for(const t of [g.away_team,g.home_team]) team[t]??={w:0,l:0,t:0,g:0};
 const a=+g.away_score,b=+g.home_score; team[g.away_team].g++;team[g.home_team].g++;
 if(a>b){team[g.away_team].w++;team[g.home_team].l++;}else if(b>a){team[g.home_team].w++;team[g.away_team].l++;}else{team[g.away_team].t++;team[g.home_team].t++;}}
const weeks=[...new Set(done.map(g=>+g.week))].sort((a,b)=>a-b), currentWeek=weeks.at(-1)||0;
const players=Object.entries(cfg.players).map(([name,teams])=>{const rec=teams.map(code=>({code,...(team[code]||{w:0,l:0,t:0,g:0})}));
 const wins=rec.reduce((n,r)=>n+r.w,0), worst=Math.min(...rec.map(r=>r.w));
 const wk=done.filter(g=>+g.week===currentWeek), weekly=teams.reduce((o,t)=>{const g=wk.find(x=>x.away_team===t||x.home_team===t);if(!g)return o;
 const a=+g.away_score,b=+g.home_score,isAway=g.away_team===t,tw=isAway?a:b,ow=isAway?b:a;if(tw>ow)o.w++;else if(tw===ow)o.t++;else o.l++;return o;},{w:0,l:0,t:0});
 return {name,teams:rec,wins,worstTeamWins:worst,weekly};});
players.sort((a,b)=>b.wins-a.wins||b.worstTeamWins-a.worstTeamWins);
const upcoming=rows.filter(g=>+g.week===currentWeek+1).map(g=>({week:+g.week,gameday:g.gameday,gametime:g.gametime,away:g.away_team,home:g.home_team}));
const out={generatedAt:new Date().toISOString(),season:cfg.season,throughWeek:currentWeek,players,undrafted:cfg.undrafted.map(code=>({code,...(team[code]||{w:0,l:0,t:0,g:0})})),upcoming};
await fs.mkdir("generated",{recursive:true});await fs.writeFile("generated/current.json",JSON.stringify(out,null,2)+"\n");
console.log(`Generated through Week ${currentWeek}`);