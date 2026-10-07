// GitHub Pages bridge. The site reads the latest generated NFL pool data directly from the repo.
window.LIVE_POOL_DATA=null;
const LIVE_DATA_URL="https://raw.githubusercontent.com/mikesandora1/Sandoras-NFL-Wins-Pool/main/generated/current.json";
window.LIVE_POOL_READY=fetch(`${LIVE_DATA_URL}?v=${Date.now()}`,{cache:"no-store"})
.then(r=>r.ok?r.json():Promise.reject(new Error("generated data unavailable")))
.then(live=>{
  window.LIVE_POOL_DATA=live;
  const names={PHI:"Eagles",DEN:"Broncos",LV:"Raiders",KC:"Chiefs",DAL:"Cowboys",MIN:"Vikings",BUF:"Bills",GB:"Packers",CLE:"Browns",DET:"Lions",PIT:"Steelers",NYG:"Giants",BAL:"Ravens",JAX:"Jaguars",NYJ:"Jets",NE:"Patriots",CIN:"Bengals",IND:"Colts",SF:"49ers",LAC:"Chargers",WAS:"Commanders",SEA:"Seahawks",TB:"Bucs",NO:"Saints",LA:"Rams",LAR:"Rams",CAR:"Panthers",ATL:"Falcons",HOU:"Texans",CHI:"Bears",TEN:"Titans",MIA:"Dolphins",ARI:"Cardinals"};
  const base=window.POOL_DATA;
  const sourcePlayers=live.recapPlayers||live.players;
  base.players=sourcePlayers.map(p=>({
    name:p.name,
    teams:p.teams.map(t=>({code:t.code,team:names[t.code]||t.code,w:t.w,l:t.l,t:t.t})),
    wins:p.wins,
    games:p.games,
    perfect:p.perfect??0,
    recent:p.recent||p.currentWeek||{w:0,l:0,t:0},
    weekly:p.weekly||{}
  }));
  base.perfectWeeks=live.perfectWeeks;
  const recapPlayers=sourcePlayers.map(p=>({...p,teams:p.teams.map(t=>({code:t.code,team:names[t.code]||t.code,w:t.w,l:t.l,t:t.t}))}));
  base.live={...live,names,recapPlayers,scoreboard:null};
  return live;
}).catch(e=>{console.warn("Using static pool fallback:",e.message);return null;});
