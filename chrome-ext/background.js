// chrome-ext/background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchChampionsLeague') {
    fetchChampionsLeague()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // jätä kanava auki async-vastausta varten
  }

  if (request.action === 'fetchMatchStats') {
    fetchMatchStats(request.matchId)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function fetchChampionsLeague() {
  console.log('Background: Haetaan Vercel-API:sta...');
  const vercelApi = 'https://overlay-six-orpin.vercel.app/api/football';

  try {
    const resp = await fetch(vercelApi, { headers: { 'Content-Type': 'application/json' } });
    if (!resp.ok) throw new Error(`Vercel API -virhe: ${resp.status}`);
    const data = await resp.json();
    if (data.matches && data.matches.length > 0) return { matches: data.matches };
    throw new Error('Vercel API ei palauttanut otteluita');
  } catch (err) {
    console.error('Background: Vercel epäonnistui, fallback football-data.orgiin:', err);
    // Fallback: suora haku yhdelle päivälle (sama kuin Vercelissä)
    const API_KEY = '31277e10b0b14a04af4c55c3da09eeb7';
    const day = '2025-10-01';
    const res = await fetch(`https://api.football-data.org/v4/competitions/CL/matches?dateFrom=${day}&dateTo=${day}`, {
      headers: { 'X-Auth-Token': API_KEY, 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Football-data.org virhe: ${res.status}`);
    const json = await res.json();
    return { matches: json.matches || [] };
  }
}

async function fetchMatchStats(matchId) {
  // Tällä hetkellä generoidaan realistiset tilastot
  const homeShots = Math.floor(Math.random() * 9) + 1;
  const awayShots = Math.floor(Math.random() * 9) + 1;

  let homePossession, awayPossession;
  if (homeShots > awayShots) { homePossession = Math.floor(Math.random() * 20) + 50; awayPossession = 100 - homePossession; }
  else if (awayShots > homeShots) { awayPossession = Math.floor(Math.random() * 20) + 50; homePossession = 100 - awayPossession; }
  else { homePossession = Math.floor(Math.random() * 10) + 45; awayPossession = 100 - homePossession; }

  const homeCorners = Math.floor(Math.random() * homeShots);
  const awayCorners = Math.floor(Math.random() * awayShots);
  const homeCards = Math.floor(Math.random() * 4);
  const awayCards = Math.floor(Math.random() * 4);
  const homeSaves = Math.floor(Math.random() * 5) + 1;
  const awaySaves = Math.floor(Math.random() * 5) + 1;
  const homeFouls = Math.floor(Math.random() * 8) + 2;
  const awayFouls = Math.floor(Math.random() * 8) + 2;

  return {
    stats: {
      homeShots, awayShots,
      homePossession, awayPossession,
      homeCorners, awayCorners,
      homeCards, awayCards,
      homeSaves, awaySaves,
      homeFouls, awayFouls
    },
    source: 'Generoidut tilastot (realistiset)'
  };
}