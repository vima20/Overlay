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
          subtitle: `Eiliset ottelut (${data.matches.length} kpl)`,
          date: "Eiliset ottelut • 1.10.2025",
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
      
      // Näytä virheviesti demo-datan sijaan
      setMatchData({
        title: "Champions League",
        subtitle: "API-virhe",
        date: "Eiliset ottelut • 1.10.2025",
        matches: []
      });
    } finally {
      setLoading(false);
    }
  };

  const showMatchStats = (match) => {
    setSelectedMatch(match);
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
                  <>
                    <div className="Overlay-header">
                      <div>
                        <div className="Overlay-title">{selectedMatch.homeTeam} vs {selectedMatch.awayTeam}</div>
                        <div className="Overlay-subtitle">Tilastot</div>
                      </div>
                      <button
                        className="Overlay-close"
                        onClick={goBackToList}
                        aria-label="Takaisin"
                      >
                        ← Takaisin
                      </button>
                    </div>

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

                    <div className="Overlay-stats">
                      <div className="Stat-row">
                        <div className="Stat-label">Laukaukset</div>
                        <div className="Stat-value">{Math.floor(Math.random() * 9) + 1} - {Math.floor(Math.random() * 9) + 1}</div>
                      </div>
                      <div className="Stat-row">
                        <div className="Stat-label">Pallon hallinta</div>
                        <div className="Stat-value">{Math.floor(Math.random() * 20) + 50}% - {Math.floor(Math.random() * 20) + 30}%</div>
                      </div>
                      <div className="Stat-row">
                        <div className="Stat-label">Kulmat</div>
                        <div className="Stat-value">{Math.floor(Math.random() * 8)} - {Math.floor(Math.random() * 8)}</div>
                      </div>
                      <div className="Stat-row">
                        <div className="Stat-label">Kortit</div>
                        <div className="Stat-value">{Math.floor(Math.random() * 4)} - {Math.floor(Math.random() * 4)}</div>
                      </div>
                      <div className="Stat-row">
                        <div className="Stat-label">Torjunnat</div>
                        <div className="Stat-value">{Math.floor(Math.random() * 5) + 1} - {Math.floor(Math.random() * 5) + 1}</div>
                      </div>
                      <div className="Stat-row">
                        <div className="Stat-label">Vaparit</div>
                        <div className="Stat-value">{Math.floor(Math.random() * 8) + 2} - {Math.floor(Math.random() * 8) + 2}</div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="Error">Virhe Champions League -tietojen lataamisessa</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;