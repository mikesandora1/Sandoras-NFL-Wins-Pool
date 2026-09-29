// v6 data bridge: generated/current.json overrides mutable 2026 data when available.
// Historical data in data.js remains the fallback/source of truth for prior seasons.
window.LIVE_POOL_DATA=null;
window.LIVE_POOL_READY=fetch("generated/current.json",{cache:"no-store"})
  .then(r=>r.ok?r.json():Promise.reject(new Error("generated data unavailable")))
  .then(d=>{window.LIVE_POOL_DATA=d;return d;})
  .catch(()=>null);
