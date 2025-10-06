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
      // Käytä Vercel API-endpointia
      const response = await fetch('/api/football');
      
      if (!response.ok) {
        throw new Error(`API-virhe: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.matches && data.matches.length > 0) {
        setMatchData({
          title: "Champions League",
          subtitle: `Ottelut (${data.matches.length} kpl)`,
          date: "1.10.2025",
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
      } else {
        throw new Error('Ei Champions League -otteluita löytynyt');
      }
      
    } catch (error) {
      console.error("API-virhe:", error);
      
      // Näytä virheviesti
      setMatchData({
        title: "Champions League",
        subtitle: "API-virhe",
        date: "1.10.2025",
        matches: []
      });
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
        <p>Paina Ctrl+K avataksesi/sulkeaksesi Champions League overlayn. Esc sulkee.</p>
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
              <div className="Loading">Ladataan Champions League -tuloksia...</div>
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
                  <div className="Error">Virhe Champions League -tietojen lataamisessa</div>
                )}
              </>
            ) : (
              <div className="Error">Virhe Champions League -tietojen lataamisessa</div>
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