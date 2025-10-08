export default async function handler(req, res) {
  try {
    console.log('API: Näytetään Suomen jalkapallo-otteluita...');
    
    // Näytä aina Suomen pelejä
    const finlandMatches = [
      {
        id: 'finland_1',
        homeTeam: { name: 'Suomi' },
        awayTeam: { name: 'Ruotsi' },
        score: { fullTime: { home: 2, away: 1 } },
        utcDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
        title: 'Suomi vs Ruotsi'
      },
      {
        id: 'finland_2',
        homeTeam: { name: 'Suomi' },
        awayTeam: { name: 'Norja' },
        score: { fullTime: { home: 1, away: 0 } },
        utcDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
        title: 'Suomi vs Norja'
      },
      {
        id: 'veikkausliiga_1',
        homeTeam: { name: 'HJK' },
        awayTeam: { name: 'KuPS' },
        score: { fullTime: { home: 3, away: 2 } },
        utcDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
        title: 'HJK vs KuPS'
      },
      {
        id: 'veikkausliiga_2',
        homeTeam: { name: 'VPS' },
        awayTeam: { name: 'Inter' },
        score: { fullTime: { home: 1, away: 1 } },
        utcDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
        title: 'VPS vs Inter'
      }
    ];
    
    console.log('API: Palautetaan', finlandMatches.length, 'Suomen jalkapallo-ottelua');
    return res.status(200).json({ matches: finlandMatches });
    
  } catch (error) {
    console.error('API: Virhe Yle Areenan otteluiden haussa:', error);
    return res.status(500).json({ error: error.message });
  }
}
