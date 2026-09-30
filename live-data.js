// v6 bridge. Static/generated data is the durable fallback; live scoreboard overlays finalized games.
window.LIVE_POOL_DATA=null;
window.LIVE_POOL_READY=fetch("generated/current.json",{cache:"no-store"})
.then(r=>r.ok?r.json():Promise.reject(new Error("generated data unavailable")))
.then(live=>{
  window.LIVE_POOL_DATA=live;
  const names={PHI:"Eagles",DEN:"Broncos",LV:"Raiders",KC:"Chiefs",DAL:"Cowboys",MIN:"Vikings",BUF:"Bills",GB:"Packers",CLE:"Browns",DET:"Lions",PIT:"Steelers",NYG:"Giants",BAL:"Ravens",JAX:"Jaguars",NYJ:"Jets",NE:"Patriots",CIN:"Bengals",IND:"Colts",SF:"49ers",LAC:"Chargers",WAS:"Commanders",SEA:"Seahawks",TB:"Bucs",NO:"Saints",LA:"Rams",LAR:"Rams",CAR:"Panthers",ATL:"Falcons",HOU:"Texans",CHI:"Bears",TEN:"Titans",MIA:"Dolphins",ARI:"Cardinals"};
  const base=window.POOL_DATA;
  const finalized=live.players.map(p=>({name:p.name,teams:p.teams.map(t=>({code:t.code,team:names[t.code]||t.code,w:t.w,l:t.l,t:t.t})),wins:p.wins,games:p.games,perfect:p.perfect,recent:p.recent,weekly:p.weekly}));
  base.players=structuredClone(finalized);
  base.perfectWeeks=live.perfectWeeks;
  base.live={...live,names,scoreboard:null};
  function applyScoreboard(sb){
    const ps=structuredClone(finalized),week=sb.week;
    if(week>live.throughWeek){
      for(const p of ps){
        let wr={w:0,l:0,t:0,finals:0};
        for(const t of p.teams){
          const g=sb.games.find(g=>g.completed&&(g.home===t.code||g.away===t.code));
          if(!g)continue;
          const mine=g.home===t.code?g.homeScore:g.awayScore,opp=g.home===t.code?g.awayScore:g.homeScore;
          t.w+=mine>opp?1:0;t.l+=mine<=opp?1:0;t.t+=mine===opp?1:0;
          t.t-=mine===opp?1:0; // pool standings treat an NFL tie as a loss, not a separate pool result
          wr.w+=mine>opp?1:0;wr.l+=mine<=opp?1:0;
        }
        p.wins=p.teams.reduce((n,t)=>n+t.w,0);p.games=p.teams.reduce((n,t)=>n+t.w+t.l+t.t,0);p.recent=wr;if(wr.finals===3&&wr.w===3)p.perfect++;
      }
    }
    base.players=ps;base.live.scoreboard=sb;
    window.dispatchEvent(new CustomEvent("pool-live-update"));
  }
  async function poll(){
    try{const r=await fetch(`/api/live-nfl?season=${live.season}&week=${live.displayWeek}`,{cache:"no-store"});if(r.ok)applyScoreboard(await r.json())}catch(e){console.warn("Live scoreboard unavailable:",e.message)}
  }
  poll();setInterval(poll,60000);
  return live;
}).catch(e=>{console.warn("Using static pool fallback:",e.message);return null;});
