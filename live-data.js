// v6 bridge. Keeps historical/static data as fallback, then overlays generated 2026 data.
window.LIVE_POOL_DATA=null;
window.LIVE_POOL_READY=fetch("generated/current.json",{cache:"no-store"})
.then(r=>r.ok?r.json():Promise.reject(new Error("generated data unavailable")))
.then(live=>{
  window.LIVE_POOL_DATA=live;
  const names={PHI:"Eagles",DEN:"Broncos",LV:"Raiders",KC:"Chiefs",DAL:"Cowboys",MIN:"Vikings",BUF:"Bills",GB:"Packers",CLE:"Browns",DET:"Lions",PIT:"Steelers",NYG:"Giants",BAL:"Ravens",JAX:"Jaguars",NYJ:"Jets",NE:"Patriots",CIN:"Bengals",IND:"Colts",SF:"49ers",LAC:"Chargers",WAS:"Commanders",SEA:"Seahawks",TB:"Bucs",NO:"Saints",LA:"Rams",CAR:"Panthers",ATL:"Falcons",HOU:"Texans",CHI:"Bears",TEN:"Titans",MIA:"Dolphins",ARI:"Cardinals"};
  const base=window.POOL_DATA;
  base.players=live.players.map(p=>({name:p.name,teams:p.teams.map(t=>({team:names[t.code]||t.code,w:t.w,l:t.l,t:t.t})),wins:p.wins,games:p.games,perfect:p.perfect,recent:p.recent,weekly:p.weekly}));
  base.perfectWeeks=live.perfectWeeks;
  base.live={...live,names};
  return live;
}).catch(e=>{console.warn("Using static pool fallback:",e.message);return null;});