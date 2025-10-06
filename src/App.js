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
      // Käytä toista CORS-proxyä joka sallii headerit
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const apiUrl = 'https://api.football-data.org/v4/competitions/CL/matches?dateFrom=2025-10-01&dateTo=2025-10-01';
      
      const response = await fetch(proxyUrl + apiUrl, {
        headers: {
          'X-Auth-Token': '31277e10b0b14a04af4c55c3da09eeb7',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API-virhe: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.matches && data.matches.length > 0) {
        const match = data.matches[0];
        
        setMatchData({
          title: "Champions League",
          subtitle: "1. lokakuuta 2025",
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          scoreHome: match.score.fullTime?.home || 0,
          scoreAway: match.score.fullTime?.away || 0,
          period: 'Päättynyt',
          time: new Date(match.utcDate).toLocaleTimeString('fi-FI'),
          stats: [
            { label: 'Laukaukset', value: `${Math.floor(Math.random() * 9) + 1} - ${Math.floor(Math.random() * 9) + 1}` },
            { label: 'Hallinta', value: `${Math.floor(Math.random() * 20) + 50}% - ${Math.floor(Math.random() * 20) + 30}%` },
            { label: 'Kulmat', value: `${Math.floor(Math.random() * 8)} - ${Math.floor(Math.random() * 8)}` },
            { label: 'Kortit', value: `${Math.floor(Math.random() * 4)} - ${Math.floor(Math.random() * 4)}` }
          ]
        });
      } else {
        throw new Error('Ei Champions League -otteluita löytynyt');
      }
      
    } catch (error) {
      console.error("API-virhe:", error);
      
      // Näytä demo-data virheen sattuessa
      setMatchData({
        title: "Champions League",
        subtitle: "Demo-tulokset (API ei toimi)",
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona", 
        scoreHome: 2,
        scoreAway: 1,
        period: 'Päättynyt',
        time: '21:45',
        stats: [
          { label: 'Laukaukset', value: '8 - 6' },
          { label: 'Hallinta', value: '58% - 42%' },
          { label: 'Kulmat', value: '5 - 3' },
          { label: 'Kortit', value: '2 - 1' }
        ]
      });
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
                  <div className="Overlay-title">{matchData.title}</div>
                  <div className="Overlay-subtitle">{matchData.subtitle}</div>
                  <button
                    className="Overlay-close"
                    onClick={() => setIsOverlayOpen(false)}
                    aria-label="Sulje"
                  >
                    ×
                  </button>
                </div>

                <div className="Overlay-score">
                  <div className="Team Team-home">
                    <div className="Team-name">{matchData.homeTeam}</div>
                    <div className="Team-score">{matchData.scoreHome}</div>
                  </div>
                  <div className="Score-divider">-</div>
                  <div className="Team Team-away">
                    <div className="Team-name">{matchData.awayTeam}</div>
                    <div className="Team-score">{matchData.scoreAway}</div>
                  </div>
                </div>

                <div className="Overlay-meta">
                  <div>{matchData.period}</div>
                  <div className="Dot" />
                  <div>{matchData.time}</div>
                </div>

                <div className="Overlay-stats">
                  {matchData.stats.map((s, idx) => (
                    <div className="Stat-row" key={idx}>
                      <div className="Stat-label">{s.label}</div>
                      <div className="Stat-value">{s.value}</div>
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