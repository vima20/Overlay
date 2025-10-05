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
      const API_KEY = '31277e10b0b14a04af4c55c3da09eeb7';
      
      // Hae kaikki live-ottelut
      const response = await fetch(`https://api.football-data.org/v4/matches?status=LIVE`, {
        headers: {
          'X-Auth-Token': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API-virhe: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.matches && data.matches.length > 0) {
        // Käytä ensimmäistä live-ottelua
        const match = data.matches[0];
        
        // Määritä ottelun tila suomeksi
        let period, time;
        switch (match.status) {
          case 'LIVE':
            period = 'Käynnissä';
            time = match.utcDate ? new Date(match.utcDate).toLocaleTimeString('fi-FI', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'Live';
            break;
          default:
            period = match.status;
            time = 'Tuntematon';
        }
        
        setMatchData({
          title: "Live Score",
          subtitle: match.competition.name,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          scoreHome: match.score.fullTime?.home || 0,
          scoreAway: match.score.fullTime?.away || 0,
          period: period,
          time: time,
          stats: [
            { label: 'Laukaukset', value: `${match.score.fullTime?.home || 0} - ${match.score.fullTime?.away || 0}` },
            { label: 'Hallinta', value: '50% - 50%' },
            { label: 'Kulmat', value: '0 - 0' },
            { label: 'Kortit', value: '0 - 0' }
          ]
        });
      } else {
        // Jos ei live-otteluita, hae tulevat ottelut
        const upcomingResponse = await fetch(`https://api.football-data.org/v4/matches?status=SCHEDULED&dateFrom=${new Date().toISOString().split('T')[0]}&dateTo=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`, {
          headers: {
            'X-Auth-Token': API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json();
          
          if (upcomingData.matches && upcomingData.matches.length > 0) {
            const match = upcomingData.matches[0];
        
        setMatchData({
              title: "Tuleva ottelu",
              subtitle: match.competition.name,
              homeTeam: match.homeTeam.name,
              awayTeam: match.awayTeam.name,
              scoreHome: 0,
              scoreAway: 0,
              period: 'Tulossa',
              time: match.utcDate ? new Date(match.utcDate).toLocaleDateString('fi-FI', { 
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 'Tulossa',
              stats: [
                { label: 'Laukaukset', value: '0 - 0' },
                { label: 'Hallinta', value: '50% - 50%' },
                { label: 'Kulmat', value: '0 - 0' },
                { label: 'Kortit', value: '0 - 0' }
              ]
            });
          } else {
            throw new Error('Ei otteluita saatavilla');
          }
        } else {
          throw new Error('Ei otteluita saatavilla');
        }
      }
      
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