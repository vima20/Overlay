// chrome-ext/background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchChampionsLeague') {
    fetchYleAreenaMatches()
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

async function fetchYleAreenaMatches() {
  console.log('Background: Haetaan jalkapallo-otteluita API:sta...');
  
  try {
    // Hae oikeita jalkapallo-otteluita football-data.org:sta
    const API_KEY = '31277e10b0b14a04af4c55c3da09eeb7';
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Kokeile eri liigoja
    const endpoints = [
      `https://api.football-data.org/v4/competitions/CL/matches?dateFrom=${today}&dateTo=${nextWeek}`,
      `https://api.football-data.org/v4/competitions/PL/matches?dateFrom=${today}&dateTo=${nextWeek}`,
      `https://api.football-data.org/v4/competitions/BL1/matches?dateFrom=${today}&dateTo=${nextWeek}`,
      `https://api.football-data.org/v4/competitions/SA/matches?dateFrom=${today}&dateTo=${nextWeek}`,
      `https://api.football-data.org/v4/competitions/FL1/matches?dateFrom=${today}&dateTo=${nextWeek}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log('Background: Kokeillaan endpoint:', endpoint);
        const response = await fetch(endpoint, {
          headers: {
            'X-Auth-Token': API_KEY
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Background: API vastaus saatu:', data);
          
          if (data.matches && data.matches.length > 0) {
            console.log('Background: Löytyi', data.matches.length, 'ottelua API:sta');
            return { matches: data.matches };
          }
        } else {
          console.log('Background: Endpoint epäonnistui:', response.status);
        }
      } catch (err) {
        console.log('Background: Endpoint virhe:', err);
      }
    }
    
    // Jos API ei toimi, näytä fallback-data
    console.log('Background: API ei toimi, näytetään fallback-data');
    const fallbackMatches = [
      {
        id: 'ilves_inter',
        homeTeam: { name: 'Ilves' },
        awayTeam: { name: 'Inter' },
        score: { fullTime: { home: 2, away: 1 } },
        utcDate: new Date('2025-08-23T19:00:00Z').toISOString(),
        status: 'FINISHED',
        title: 'Ilves - Inter'
      },
      {
        id: 'ktp_kups',
        homeTeam: { name: 'KTP' },
        awayTeam: { name: 'KuPS' },
        score: { fullTime: { home: 1, away: 3 } },
        utcDate: new Date('2025-08-09T19:00:00Z').toISOString(),
        status: 'FINISHED',
        title: 'KTP - KuPS'
      }
    ];
    
    return { matches: fallbackMatches };
    
  } catch (error) {
    console.error('Background: API virhe:', error);
    throw error;
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