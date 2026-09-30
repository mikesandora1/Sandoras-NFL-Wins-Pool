const MAP={WSH:"WAS",JAC:"JAX",LAR:"LAR"};
const norm=x=>MAP[x]||x;
export default async(req)=>{
  try{
    const url=new URL(req.url),week=url.searchParams.get("week")||"1";
    const season=url.searchParams.get("season")||"2026";
    const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${season}&seasontype=2&week=${week}`,{headers:{"user-agent":"Sandoras-NFL-Wins-Pool/1.0"}});
    if(!r.ok)throw new Error(`scoreboard ${r.status}`);
    const j=await r.json();
    const games=(j.events||[]).map(e=>{
      const c=e.competitions?.[0],cs=c?.competitors||[],home=cs.find(x=>x.homeAway==="home"),away=cs.find(x=>x.homeAway==="away"),state=e.status?.type?.state||"pre";
      return{id:e.id,date:e.date,state,completed:!!e.status?.type?.completed,detail:e.status?.type?.shortDetail||"",home:norm(home?.team?.abbreviation||""),away:norm(away?.team?.abbreviation||""),homeScore:+(home?.score||0),awayScore:+(away?.score||0)};
    });
    return new Response(JSON.stringify({season:+season,week:+week,updatedAt:new Date().toISOString(),games}),{headers:{"content-type":"application/json","cache-control":"public,max-age=30"}});
  }catch(e){return new Response(JSON.stringify({error:e.message}),{status:502,headers:{"content-type":"application/json"}})}
}
export const config={path:"/api/live-nfl"};
