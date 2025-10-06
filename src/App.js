import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);

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
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [matchData]);

  const fetchLiveScore = async () => {
    setLoading(true);
    try {
      // Demo-data joka näyttää samalta kuin Chrome Extension
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
        }
      ];

      setMatchData({
        title: "Champions League",
        subtitle: "Eiliset ottelut (9 kpl)",
        date: "Eiliset ottelut • 1.10.2025",
        matches: demoMatches
      });
      
    } catch (error) {
      console.error("API-virhe:", error);
      setMatchData(null);
    } finally {
      setLoading(false);
    }
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
                      <button className="Stats-button">📊 Tilastot</button>
                    </div>
                  ))}
                </div>
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