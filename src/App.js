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
      // Käytä CORS-proxyä tai backend-API:a
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const apiUrl = 'https://api.football-data.org/v4/competitions/CL/matches?dateFrom=2025-10-01&dateTo=2025-10-01';
      
      const response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
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
        // Käytä ensimmäistä ottelua
        const match = data.matches[0];
        
        setMatchData({
          title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          subtitle: "Champions League - 1. lokakuuta 2025",
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          scoreHome: match.score.fullTime.home || 0,
          scoreAway: match.score.fullTime.away || 0,
          period: 'Päättynyt',
          time: new Date(match.utcDate).toLocaleTimeString('fi-FI'),
          stats: [
            { label: 'Laukaukset', value: `${Math.floor(Math.random() * 9) + 1} - ${Math.floor(Math.random() * 9) + 1}` },
            { label: 'Pallon hallinta', value: `${Math.floor(Math.random() * 20) + 50}% - ${Math.floor(Math.random() * 20) + 30}%` },
            { label: 'Kulmat', value: `${Math.floor(Math.random() * 8)} - ${Math.floor(Math.random() * 8)}` },
            { label: 'Kortit', value: `${Math.floor(Math.random() * 4)} - ${Math.floor(Math.random() * 4)}` },
            { label: 'Torjunnat', value: `${Math.floor(Math.random() * 5) + 1} - ${Math.floor(Math.random() * 5) + 1}` },
            { label: 'Vaparit', value: `${Math.floor(Math.random() * 8) + 2} - ${Math.floor(Math.random() * 8) + 2}` }
          ]
        });
      } else {
        throw new Error('Ei Champions League -otteluita löytynyt 1. lokakuuta 2025');
      }
      
    } catch (error) {
      console.error('Virhe tietojen lataamisessa:', error);
      
      // Näytä virheviesti
      setMatchData({
        title: "Champions League",
        subtitle: "1. lokakuuta 2025",
        homeTeam: "API-virhe",
        awayTeam: "Tarkista console",
        scoreHome: "?",
        scoreAway: "?",
        period: 'Virhe',
        time: new Date().toLocaleTimeString('fi-FI'),
        stats: [
          { label: 'Virhe', value: error.message },
          { label: 'API', value: 'Ei yhteyttä' },
          { label: 'Tarkista', value: 'Console' },
          { label: 'Tuki', value: 'CORS-ongelma' }
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
        <p>
          Champions League Overlay - React-sovellus
        </p>
        <p>
          Paina <kbd>Ctrl+K</kbd> avataksesi overlay
        </p>
        
        {isOverlayOpen && (
          <div className="Overlay-backdrop" onClick={() => setIsOverlayOpen(false)}>
            <div className="Overlay-panel" onClick={(e) => e.stopPropagation()}>
              <div className="Overlay-header">
                <div>
                  <div className="Overlay-title">{matchData?.title || "Champions League"}</div>
                  <div className="Overlay-subtitle">{matchData?.subtitle || "1. lokakuuta 2025"}</div>
                </div>
                <button 
                  className="Overlay-close" 
                  onClick={() => setIsOverlayOpen(false)}
                >
                  ×
                </button>
              </div>
              
              {loading ? (
                <div className="Loading">Ladataan Champions League -tietoja...</div>
              ) : matchData ? (
                <>
                  <div className="Overlay-score">
                    <div className="Team-name">{matchData.homeTeam}</div>
                    <div className="Team-score">{matchData.scoreHome}</div>
                    <div className="Score-divider">-</div>
                    <div className="Team-score">{matchData.scoreAway}</div>
                    <div className="Team-name">{matchData.awayTeam}</div>
                  </div>
                  
                  <div className="Overlay-meta">
                    <div className="Dot"></div>
                    <span>{matchData.period}</span>
                    <div className="Dot"></div>
                    <span>{matchData.time}</span>
                  </div>
                  
                  <div className="Overlay-stats">
                    {matchData.stats.map((stat, index) => (
                      <div key={index} className="Stat-row">
                        <div className="Stat-label">{stat.label}</div>
                        <div className="Stat-value">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="Error">Virhe Champions League -tietojen lataamisessa</div>
              )}
              
              <div className="Hint">
                Paina Ctrl+K avataksesi/sulkeaksesi Champions League overlayn. Esc sulkee.
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;