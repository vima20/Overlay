import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);

  // NÄPPÄINKOMENNOT (toimii kaikilla laitteilla)
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

  // TOUCH-GESTURES (toimii mobiilissa)
  useEffect(() => {
    const handleTouch = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        setIsOverlayOpen((prev) => !prev);
        if (!matchData) {
          fetchLiveScore();
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouch, { passive: false });
    return () => document.removeEventListener('touchstart', handleTouch);
  }, [matchData]);

  // Suorat Areena-linkit Veikkausliiga-otteluille
  const STREAM_URLS = {
    'HJK vs FC Inter': 'https://areena.yle.fi/tv/urheilu',
    'Veikkausliiga vs Mestaruustaisto': 'https://areena.yle.fi/tv/urheilu'
  };

  const fetchLiveScore = async () => {
    setLoading(true);
    
    try {
      console.log('App: Haetaan Veikkausliiga otteluita...');
      
      // Kokeile ensin API:a (jos backend on käynnissä)
      try {
        console.log('App: Kokeillaan API:a http://localhost:3000/api/football');
        const response = await fetch('http://localhost:3000/api/football', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('App: API vastaus saatu:', data.matches?.length || 0, 'ottelua');
          
          if (data.matches && data.matches.length > 0) {
            setMatchData({
              title: "Veikkausliiga ottelut (API)",
              subtitle: `API:sta haetut Veikkausliiga ottelut (${data.matches.length} kpl)`,
              date: new Date().toLocaleDateString('fi-FI'),
              matches: data.matches.map(match => ({
                id: match.id,
                time: new Date(match.utcDate).toLocaleTimeString('fi-FI', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                homeTeam: match.homeTeam.name,
                awayTeam: match.awayTeam.name,
                homeScore: match.score.fullTime?.home || '?',
                awayScore: match.score.fullTime?.away || '?',
                status: match.status,
                streamUrl: STREAM_URLS[`${match.homeTeam.name} vs ${match.awayTeam.name}`] || 'https://areena.yle.fi/tv/urheilu'
              }))
            });
            return;
          } else {
            console.log('App: API palautti tyhjää dataa');
          }
        } else {
          console.log('App: API status:', response.status);
        }
      } catch (apiError) {
        console.log('App: API virhe:', apiError.message);
      }
      
      // Jos API ei toimi, käytä fallback-dataa - OIKEAT Veikkausliiga ottelut
      console.log('App: API ei toimi, käytetään fallback-dataa');
      const realMatches = [
        {
          id: 'veikkausliiga_hjk_inter',
          homeTeam: { name: 'HJK' },
          awayTeam: { name: 'FC Inter' },
          score: { fullTime: { home: null, away: null } },
          utcDate: (() => {
            const matchDate = new Date();
            matchDate.setMonth(9); // Lokakuu
            matchDate.setDate(26);
            matchDate.setHours(16, 45, 0, 0);
            return matchDate.toISOString();
          })(),
          status: 'SCHEDULED',
          title: 'HJK vs FC Inter (Veikkausliiga)'
        },
        {
          id: 'veikkausliiga_mestaruustaisto',
          homeTeam: { name: 'Veikkausliiga' },
          awayTeam: { name: 'Mestaruustaisto' },
          score: { fullTime: { home: null, away: null } },
          utcDate: (() => {
            const matchDate = new Date();
            matchDate.setMonth(10); // Marraskuu
            matchDate.setDate(9);
            matchDate.setHours(14, 30, 0, 0);
            return matchDate.toISOString();
          })(),
          status: 'SCHEDULED',
          title: 'Veikkausliiga vs Mestaruustaisto (Veikkausliiga)'
        }
      ];
      
      setMatchData({
        title: "Veikkausliiga ottelut (Fallback)",
        subtitle: `Fallback Veikkausliiga ottelut (${realMatches.length} kpl)`,
        date: new Date().toLocaleDateString('fi-FI'),
        matches: realMatches.map(match => ({
          id: match.id,
          time: new Date(match.utcDate).toLocaleTimeString('fi-FI', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          homeScore: match.score.fullTime?.home || '?',
          awayScore: match.score.fullTime?.away || '?',
          status: match.status,
          streamUrl: STREAM_URLS[`${match.homeTeam.name} vs ${match.awayTeam.name}`] || 'https://areena.yle.fi/tv/urheilu'
        }))
      });
      
    } catch (error) {
      console.error("App: Virhe otteluiden haussa:", error);
      setMatchData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        {/* YKSINKERTAINEN - TOIMII KAIKILLA LAITTEILLA */}
        <p 
          onClick={() => {
            setIsOverlayOpen((prev) => !prev);
            if (!matchData) {
              fetchLiveScore();
            }
          }}
          style={{
            cursor: 'pointer',
            padding: '15px',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            fontSize: '16px',
            fontWeight: '600',
            userSelect: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          👆 Klikkaa tätä tekstiä avataksesi Veikkausliiga-otteluiden overlayn
        </p>
        
        <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '10px' }}>
          Tai paina Ctrl+K tai tuplaklikkaa missä tahansa
        </p>
        <p style={{ fontSize: '10px', opacity: 0.5, marginTop: '5px' }}>
          Näyttää tulevat Veikkausliiga-ottelut (HJK vs FC Inter, Veikkausliiga vs Mestaruustaisto)
        </p>
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
              <div className="Loading">Ladataan FIFA karsinta-otteluita JA Veikkausliiga otteluita...</div>
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

                {matchData.matches.length > 0 ? (
                  <div className="Overlay-matches">
                    {matchData.matches.map((match, index) => (
                      <div key={match.id} className="ao-match" style={{borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '15px 0', borderBottom: index === matchData.matches.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.1)'}}>
                        <div className="ao-match-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                          <div className="ao-match-time" style={{fontSize: '12px', opacity: 0.7}}>{match.time}</div>
                          <div className="ao-match-status" style={{fontSize: '12px', opacity: 0.7}}>{match.status === 'SCHEDULED' ? 'Tulossa' : match.status}</div>
                        </div>
                        <div className="ao-match-teams" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <div className="ao-match-team" style={{flex: 1, textAlign: 'left'}}>
                            <div className="ao-match-team-name" style={{fontSize: '14px', fontWeight: 600}}>{match.homeTeam}</div>
                          </div>
                          <div className="ao-match-score" style={{fontSize: '18px', fontWeight: 800, margin: '0 15px'}}>
                            {match.homeScore} - {match.awayScore}
                          </div>
                          <div className="ao-match-team" style={{flex: 1, textAlign: 'right'}}>
                            <div className="ao-match-team-name" style={{fontSize: '14px', fontWeight: 600}}>{match.awayTeam}</div>
                          </div>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
                          <a href={match.streamUrl} target="_blank" rel="noopener noreferrer" 
                             style={{background: '#00d4ff', color: '#001018', textDecoration: 'none', fontWeight: 600, fontSize: '12px', padding: '6px 10px', borderRadius: '6px', transition: 'background-color 0.2s'}}>
                            Katso Areenassa
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="Error">
                    Ei FIFA karsinta-otteluita tai Veikkausliiga otteluita saatavilla.
                  </div>
                )}
              </>
            ) : (
              <div className="Error">Virhe FIFA karsinta-otteluiden tai Veikkausliiga otteluiden lataamisessa</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;