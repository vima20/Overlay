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
    
    // Käytä vain demo-dataa (ei API-kutsuja)
    setTimeout(() => {
      const demoMatches = [
        {
          id: 1,
          time: "19.45",
          homeTeam: "Qarabağ Ağdam FK",
          awayTeam: "FC København",
          homeScore: 2,
          awayScore: 0,
          status: "FINISHED"
        },
        {
          id: 2,
          time: "19.45", 
          homeTeam: "Royale Union Saint-Gilloise",
          awayTeam: "Newcastle United FC",
          homeScore: 0,
          awayScore: 4,
          status: "FINISHED"
        },
        {
          id: 3,
          time: "22.00",
          homeTeam: "Borussia Dortmund", 
          awayTeam: "Athletic Club",
          homeScore: 4,
          awayScore: 1,
          status: "FINISHED"
        },
        {
          id: 4,
          time: "19.45",
          homeTeam: "Real Madrid",
          awayTeam: "Barcelona",
          homeScore: 3,
          awayScore: 1,
          status: "FINISHED"
        },
        {
          id: 5,
          time: "22.00",
          homeTeam: "Manchester City",
          awayTeam: "Liverpool",
          homeScore: 2,
          awayScore: 2,
          status: "FINISHED"
        },
        {
          id: 6,
          time: "19.45",
          homeTeam: "Bayern Munich",
          awayTeam: "PSG",
          homeScore: 1,
          awayScore: 3,
          status: "FINISHED"
        },
        {
          id: 7,
          time: "22.00",
          homeTeam: "Chelsea",
          awayTeam: "Arsenal",
          homeScore: 2,
          awayScore: 1,
          status: "FINISHED"
        },
        {
          id: 8,
          time: "19.45",
          homeTeam: "Inter Milan",
          awayTeam: "AC Milan",
          homeScore: 0,
          awayScore: 2,
          status: "FINISHED"
        },
        {
          id: 9,
          time: "22.00",
          homeTeam: "Atletico Madrid",
          awayTeam: "Sevilla",
          homeScore: 3,
          awayScore: 0,
          status: "FINISHED"
        }
      ];

      setMatchData({
        title: "Champions League",
        subtitle: "Eiliset ottelut (9 kpl)",
        date: "Eiliset ottelut • 1.10.2025",
        matches: demoMatches
      });
      
      setLoading(false);
    }, 1000); // 1 sekunnin viive simuloidakseen latausta
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