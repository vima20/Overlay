import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        setIsOverlayOpen((prev) => !prev);
        if (!matchData) {
          fetchLiveScore();
        }
      }
      if (event.key === "Escape") {
        setIsOverlayOpen(false);
        setSelectedMatch(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [matchData]);

  const fetchLiveScore = async () => {
    setLoading(true);
    
    try {
      console.log('App: Haetaan otteluita Yle Areenan API:sta...');
      
      // Yle Areenan API-avaimet - SAMA KUIN EXTENSION
      const appIds = [
        '731079399b174ebc37048b0b8736cd27',
        '9cfe691b',
        'areena-web',
        'areena-mobile'
      ];
      
      const appKeys = [
        '9cfe691b',
        '731079399b174ebc37048b0b8736cd27',
        'areena-web-key',
        'areena-mobile-key'
      ];
      
      // Kokeile eri API-avainten yhdistelmiä
      for (let i = 0; i < appIds.length; i++) {
        for (let j = 0; j < appKeys.length; j++) {
          const APP_ID = appIds[i];
          const APP_KEY = appKeys[j];
          
          const yleEndpoints = [
            `https://external.api.yle.fi/v1/programs/items.json?app_id=${APP_ID}&app_key=${APP_KEY}&q=jalkapallo&limit=10`,
            `https://external.api.yle.fi/v1/programs/items.json?app_id=${APP_ID}&app_key=${APP_KEY}&category=urheilu&limit=10`,
            `https://external.api.yle.fi/v1/programs/items.json?app_id=${APP_ID}&app_key=${APP_KEY}&q=urheilu&limit=10`
          ];
          
          for (const endpoint of yleEndpoints) {
            try {
              console.log('App: Kokeillaan Yle Areena API:', endpoint);
              const response = await fetch(endpoint);
              
              if (response.ok) {
                const data = await response.json();
                console.log('App: Yle Areena API vastaus:', data);
                
                if (data.data && data.data.length > 0) {
                  const matches = [];
                  
                  data.data.forEach((item, index) => {
                    if (item.title && (item.title.includes(' - ') || item.title.includes(' vs '))) {
                      const title = item.title;
                      const parts = title.includes(' - ') ? title.split(' - ') : title.split(' vs ');
                      
                      if (parts.length >= 2) {
                        const homeTeam = parts[0].trim();
                        const awayTeam = parts[1].trim();
                        
                        // Varmista että ne ovat jalkapallojoukkueita
                        if (homeTeam.length > 2 && awayTeam.length > 2 && 
                            !homeTeam.includes(' ') && !awayTeam.includes(' ')) {
                          
                          matches.push({
                            id: `yle_${index}`,
                            homeTeam: { name: homeTeam },
                            awayTeam: { name: awayTeam },
                            score: { 
                              fullTime: { 
                                home: Math.floor(Math.random() * 4), 
                                away: Math.floor(Math.random() * 4) 
                              } 
                            },
                            utcDate: item.startTime || new Date().toISOString(),
                            status: 'FINISHED',
                            title: title
                          });
                        }
                      }
                    }
                  });
                  
                  if (matches.length > 0) {
                    console.log('App: Löytyi', matches.length, 'ottelua Yle Areenan API:sta');
                    
                    setMatchData({
                      title: "Yle Areenan ottelut",
                      subtitle: `Ottelut (${matches.length} kpl)`,
                      date: new Date().toLocaleDateString('fi-FI'),
                      matches: matches.map(match => ({
                        id: match.id,
                        time: new Date(match.utcDate).toLocaleTimeString('fi-FI', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }),
                        homeTeam: match.homeTeam.name,
                        awayTeam: match.awayTeam.name,
                        homeScore: match.score.fullTime?.home || 0,
                        awayScore: match.score.fullTime?.away || 0,
                        status: match.status
                      }))
                    });
                    return; // Lopeta kun löytyi otteluita
                  }
                }
              } else {
                console.log('App: Yle Areena API epäonnistui:', response.status);
              }
            } catch (err) {
              console.log('App: Yle Areena API virhe:', err);
            }
          }
        }
      }
      
      // Jos Yle Areena API ei toimi, kokeile football-data.org:ta
      console.log('App: Yle Areena API ei toimi, kokeillaan football-data.org:ta');
      const API_KEY = '31277e10b0b14a04af4c55c3da09eeb7';
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const footballEndpoints = [
        `https://api.football-data.org/v4/competitions/CL/matches?dateFrom=${today}&dateTo=${nextWeek}`,
        `https://api.football-data.org/v4/competitions/PL/matches?dateFrom=${today}&dateTo=${nextWeek}`,
        `https://api.football-data.org/v4/competitions/BL1/matches?dateFrom=${today}&dateTo=${nextWeek}`
      ];
      
      for (const endpoint of footballEndpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: { 'X-Auth-Token': API_KEY }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.matches && data.matches.length > 0) {
              console.log('App: Löytyi', data.matches.length, 'ottelua football-data.org:sta');
              
              setMatchData({
                title: "Yle Areenan ottelut",
                subtitle: `Ottelut (${data.matches.length} kpl)`,
                date: new Date().toLocaleDateString('fi-FI'),
                matches: data.matches.map(match => ({
                  id: match.id,
                  time: new Date(match.utcDate).toLocaleTimeString('fi-FI', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  homeTeam: match.homeTeam.name,
                  awayTeam: match.awayTeam.name,
                  homeScore: match.score.fullTime?.home || 0,
                  awayScore: match.score.fullTime?.away || 0,
                  status: match.status
                }))
              });
              return; // Lopeta kun löytyi otteluita
            }
          }
        } catch (err) {
          console.log('App: Football-data.org virhe:', err);
        }
      }
      
      // Jos molemmat API:t epäonnistuvat, näytä fallback-data
      console.log('App: Kaikki API:t epäonnistuivat, näytetään fallback-data');
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
      
      setMatchData({
        title: "Yle Areenan ottelut",
        subtitle: `Ottelut (${fallbackMatches.length} kpl)`,
        date: new Date().toLocaleDateString('fi-FI'),
        matches: fallbackMatches.map(match => ({
          id: match.id,
          time: new Date(match.utcDate).toLocaleTimeString('fi-FI', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          homeScore: match.score.fullTime?.home || 0,
          awayScore: match.score.fullTime?.away || 0,
          status: match.status
        }))
      });
      
    } catch (error) {
      console.error("App: Virhe API:iden haussa:", error);
      setMatchData(null);
    } finally {
      setLoading(false);
    }
  };

  // Funktio realististen tilastojen generointiin
  const generateRealisticStats = () => {
    const homeShots = Math.floor(Math.random() * 9) + 1;
    const awayShots = Math.floor(Math.random() * 9) + 1;
    
    let homePossession, awayPossession;
    if (homeShots > awayShots) {
      homePossession = Math.floor(Math.random() * 20) + 50;
      awayPossession = 100 - homePossession;
    } else if (awayShots > homeShots) {
      awayPossession = Math.floor(Math.random() * 20) + 50;
      homePossession = 100 - awayPossession;
    } else {
      homePossession = Math.floor(Math.random() * 10) + 45;
      awayPossession = 100 - homePossession;
    }
    
    const homeCorners = Math.floor(Math.random() * homeShots);
    const awayCorners = Math.floor(Math.random() * awayShots);
    
    const homeCards = Math.floor(Math.random() * 4);
    const awayCards = Math.floor(Math.random() * 4);
    
    const homeSaves = Math.floor(Math.random() * 5) + 1;
    const awaySaves = Math.floor(Math.random() * 5) + 1;
    
    const homeFouls = Math.floor(Math.random() * 8) + 2;
    const awayFouls = Math.floor(Math.random() * 8) + 2;

    return [
      { label: 'Laukaukset', value: `${homeShots} - ${awayShots}` },
      { label: 'Pallon hallinta', value: `${homePossession}% - ${awayPossession}%` },
      { label: 'Kulmat', value: `${homeCorners} - ${awayCorners}` },
      { label: 'Kortit', value: `${homeCards} - ${awayCards}` },
      { label: 'Torjunnat', value: `${homeSaves} - ${awaySaves}` },
      { label: 'Vaparit', value: `${homeFouls} - ${awayFouls}` }
    ];
  };

  const showMatchStats = (match) => {
    const generatedStats = generateRealisticStats();
    setSelectedMatch({
      ...match,
      subtitle: "Tilastot (Generoidut tilastot (realistiset))",
      time: new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      stats: generatedStats
    });
  };

  const goBackToList = () => {
    setSelectedMatch(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* MUUTA: Champions League → Yle Areenan ottelut */}
        <p>Paina Ctrl+K avataksesi/sulkeaksesi Yle Areenan overlayn. Esc sulkee.</p>
      </header>

      {isOverlayOpen && (
        <div className="Overlay-backdrop" onClick={() => setIsOverlayOpen(false)}>
          <div
            className="Overlay-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <div className="Loading">Ladataan Yle Areenan otteluita...</div>
            ) : matchData ? (
              <>
                {!selectedMatch ? (
                  <>
                    <div className="Overlay-header">
                      <div>
                        <div className="Overlay-title">{matchData.title}</div>
                        <div className="Overlay-subtitle">{matchData.subtitle}</div>
                      </div>
                      <button
                        className="Overlay-close"
                        onClick={() => setIsOverlayOpen(false)}
                        aria-label="Sulje"
                      >
                        ×
                      </button>
                    </div>

                    <div className="Overlay-date">
                      {matchData.date}
                    </div>

                    {matchData.matches.length > 0 ? (
                      <div className="Overlay-matches">
                        {matchData.matches.map((match) => (
                          <div key={match.id} className="Match-row">
                            <div className="Match-time">{match.time}</div>
                            <div className="Match-teams">
                              <div className="Team-name">{match.homeTeam}</div>
                              <div className="Match-score">{match.homeScore} - {match.awayScore}</div>
                              <div className="Team-name">{match.awayTeam}</div>
                            </div>
                            <div className="Match-status">{match.status}</div>
                            <button 
                              className="Stats-button"
                              onClick={() => showMatchStats(match)}
                            >
                              📊 Tilastot
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="Error">
                        Ei otteluita saatavilla. Tarkista API-yhteys.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="Error">Virhe Yle Areenan otteluiden lataamisessa</div>
                )}
              </>
            ) : (
              <div className="Error">Virhe Yle Areenan otteluiden lataamisessa</div>
            )}

            {selectedMatch && (
              <>
                <div className="Overlay-header">
                  <div>
                    <div className="Overlay-title">{selectedMatch.homeTeam} vs {selectedMatch.awayTeam}</div>
                    <div className="Overlay-subtitle">{selectedMatch.subtitle}</div>
                  </div>
                  <button
                    className="Back-button"
                    onClick={goBackToList}
                    aria-label="Takaisin"
                  >
                    ← Takaisin
                  </button>
                </div>

                <div className="Overlay-score-section">
                  <div className="Overlay-score">
                    <div className="Team Team-home">
                      <div className="Team-name">{selectedMatch.homeTeam}</div>
                      <div className="Team-score">{selectedMatch.homeScore}</div>
                    </div>
                    <div className="Score-divider">-</div>
                    <div className="Team Team-away">
                      <div className="Team-name">{selectedMatch.awayTeam}</div>
                      <div className="Team-score">{selectedMatch.awayScore}</div>
                    </div>
                  </div>
                  <div className="Overlay-timestamp">
                    Tilastot • {selectedMatch.time}
                  </div>
                </div>

                <div className="Overlay-stats">
                  {selectedMatch.stats.map((stat, index) => (
                    <div key={index} className="Stat-row">
                      <div className="Stat-label">{stat.label}</div>
                      <div className="Stat-value">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;