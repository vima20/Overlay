async function fetchChampionsLeague(dateFrom, dateTo) {
  console.log('Background: Haetaan Champions League -otteluita Vercel-API:n kautta...');
  const vercelApi = 'https://overlay-six-orpin.vercel.app/api/football';

  try {
    const resp = await fetch(vercelApi, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!resp.ok) {
      throw new Error(`Vercel API -virhe: ${resp.status}`);
    }

    const data = await resp.json();
    console.log('Background: Vercel-API vastaus:', data);

    if (data.matches && data.matches.length > 0) {
      return { matches: data.matches };
    }
    throw new Error('Vercel API ei palauttanut otteluita');
  } catch (err) {
    console.error('Background: Vercel-API epäonnistui, fallback suoraan football-data.orgiin:', err);

    // Fallback: suora haku yhdelle päivälle kuten aiemmin
    const API_KEY = '31277e10b0b14a04af4c55c3da09eeb7';
    const october1_2025 = '2025-10-01';
    const response = await fetch(`https://api.football-data.org/v4/competitions/CL/matches?dateFrom=${october1_2025}&dateTo=${october1_2025}`, {
      headers: {
        'X-Auth-Token': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Football-data.org API-virhe: ${response.status}`);
    }

    const data = await response.json();
    return { matches: data.matches || [] };
  }
}