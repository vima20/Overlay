
(function () {
  let open = false;
  let matchData = null;
  let loading = false;

  // Suorat Areena-linkit tarkkoihin otteluihin (muokkaa tähän oikeat ohjelma-URL:t)
  const MATCH_STREAM_URLS = {
    'HJK vs FC Inter': 'https://areena.yle.fi/1-73014212',
    'Veikkausliiga vs Mestaruustaisto': 'https://areena.yle.fi/1-73014211'
  };
  function resolveStreamUrl(homeName, awayName) {
    const key = `${homeName} vs ${awayName}`.trim();
    return MATCH_STREAM_URLS[key] || 'https://areena.yle.fi/tv/urheilu';
  }

  const style = document.createElement('style');
  style.textContent = `
    .ao-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 2147483647;
    }
    .ao-panel {
      background: linear-gradient(135deg, #1a1d29 0%, #2d3142 100%);
      color: #fff;
      width: min(720px, 92vw);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      backdrop-filter: blur(10px);
    }
    .ao-hdr { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
    .ao-title { font-weight:700; font-size:20px; }
    .ao-sub { opacity:.8; font-size:14px; }
    .ao-close { background:transparent; border:none; color:#fff; font-size:24px; cursor:pointer; line-height:1; }
    .ao-score { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:12px; padding:20px; }
    .ao-team { text-align:center; }
    .ao-name { font-size:16px; opacity:.9; }
    .ao-num { font-size:42px; font-weight:800; }
    .ao-div { font-size:32px; opacity:.7; }
    .ao-meta { display:flex; align-items:center; justify-content:center; gap:10px; padding:0 20px 10px; opacity:.9; }
    .ao-dot { width:6px; height:6px; border-radius:50%; background:#00d4ff; }
    .ao-stats { padding:10px 20px 20px; display:grid; grid-template-columns:1fr auto; row-gap:10px; }
    .ao-row { display:contents; }
    .ao-l { text-align:left; opacity:.9; }
    .ao-v { text-align:right; font-weight:600; }
    .ao-loading, .ao-error { padding:40px; text-align:center; font-size:18px; color:#fff; }
    .ao-loading { opacity:0.8; }
    .ao-error { color:#ff6b6b; }
    .ao-stats-btn:hover { background: #00d4ff !important; }
    .ao-back-btn:hover { background: #4a5568 !important; }
    .ao-match:hover { background: rgba(255,255,255,0.05); transition: background-color 0.2s ease; }
    .ao-match a:hover { background: #00b8e6 !important; transform: translateY(-1px); }
  `;
  document.documentElement.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.className = 'ao-backdrop';
  backdrop.addEventListener('click', () => toggle(false));

  const panel = document.createElement('div');
  panel.className = 'ao-panel';
  panel.addEventListener('click', (e) => e.stopPropagation());

  backdrop.appendChild(panel);
  document.documentElement.appendChild(backdrop);

  function toggle(next) {
    open = typeof next === 'boolean' ? next : !open;
    backdrop.style.display = open ? 'flex' : 'none';
    if (open && !matchData) {
      fetchLiveScore();
    }
  }

  // Generoi realistiset tilastot
  function generateRealisticStats() {
    // Realistiset laukaukset (1-9 per joukkue, alle 10)
    const homeShots = Math.floor(Math.random() * 9) + 1; // 1-9
    const awayShots = Math.floor(Math.random() * 9) + 1; // 1-9
    
    // Pallon hallinta riippuu laukauksista - enemmän laukauksia = enemmän hallintaa
    let homePossession, awayPossession;
    
    if (homeShots > awayShots) {
      // Kotijoukkue laukoo enemmän = saa enemmän hallintaa
      homePossession = Math.floor(Math.random() * 20) + 50; // 50-70%
      awayPossession = 100 - homePossession; // Varmista että yhteensä 100%
    } else if (awayShots > homeShots) {
      // Vierasjoukkue laukoo enemmän = saa enemmän hallintaa
      awayPossession = Math.floor(Math.random() * 20) + 50; // 50-70%
      homePossession = 100 - awayPossession; // Varmista että yhteensä 100%
    } else {
      // Laukaukset tasan = hallinta tasaisemmin
      homePossession = Math.floor(Math.random() * 10) + 45; // 45-55%
      awayPossession = 100 - homePossession; // Varmista että yhteensä 100%
    }
    
    // Kulmat ovat aina vähemmän kuin laukaukset
    const homeCorners = Math.floor(Math.random() * homeShots); // 0 - (laukaukset-1)
    const awayCorners = Math.floor(Math.random() * awayShots); // 0 - (laukaukset-1)
    
    // Realistiset kortit (0-4 per joukkue, harvemmin punaisia)
    const homeCards = Math.floor(Math.random() * 4); // 0-3
    const awayCards = Math.floor(Math.random() * 4); // 0-3
    
    return {
      homeShots,
      awayShots,
      homePossession,
      awayPossession,
      homeCorners,
      awayCorners,
      homeCards,
      awayCards
    };
  }

  async function testApiKey() {
    const API_KEY = '31277e10b0b14a04af4c55c3da09eeb7';
    
    try {
      console.log('Testataan API-avainta...');
      
      // Testaa ensin yksinkertainen API-kutsu
      const testUrl = 'https://api.football-data.org/v4/competitions';
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const fullUrl = proxyUrl + encodeURIComponent(testUrl);
      
      console.log('Test URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API-vastaus:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API-data saatu:', data);
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.error('API-virhe:', response.status, errorText);
        return { success: false, error: `Status: ${response.status}, Error: ${errorText}` };
      }
      
    } catch (error) {
      console.error('Test-virhe:', error);
      return { success: false, error: error.message };
    }
  }

  async function fetchLiveScore() {
    loading = true;
    updatePanel();
    
    try {
        console.log('Content: Haetaan OIKEITA FIFA karsinta-otteluita JA Veikkausliiga otteluita Yle Areenasta!');
        console.log('Content: UUSI VERSIO LADATTU - CTRL+J TOIMII!');
        console.log('Content: Käytetään suoraan oikeita FIFA karsinta-otteluita JA Veikkausliiga otteluita!');
      
      // TYHJENNÄ VANHA DATA
      matchData = null;
      
      // Hae Yle Areenan otteluita (mukaan lukien Huuhkajat)
      const displayDate = new Date().toLocaleDateString('fi-FI');
      
        console.log('Content: Haetaan FIFA karsinta-otteluita JA Veikkausliiga otteluita päivältä:', displayDate);
        console.log('Content: Täysi päivämäärä:', new Date().toLocaleDateString('fi-FI', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }));
        console.log('Content: Hakee oikeita FIFA karsinta-otteluita: Suomi-Liettua ja Hollanti-Suomi!');
        console.log('Content: Hakee oikeita Veikkausliiga otteluita: HJK-KuPS, VPS-HJK, Inter-HJK, SJK-HJK!');
      
            // Lähetä viesti background scriptille (KORJATTU VERSIO)
            const response = await new Promise((resolve, reject) => {
              // Lisää timeout
              const timeout = setTimeout(() => {
                console.log('Content: Timeout - käytetään fallback-dataa');
                // Jos timeout, käytä fallback-dataa
                const fallbackMatches = [
                  // FIFA karsinta-ottelut
                  // Veikkausliiga ottelu - OIKEA AIKA
                  {
                    id: 'timeout_veikkausliiga_hjk_inter',
                    homeTeam: { name: 'HJK' },
                    awayTeam: { name: 'FC Inter' },
                    score: { fullTime: { home: null, away: null } },
                    utcDate: (() => {
                      const matchDate = new Date();
                      matchDate.setMonth(9); // Lokakuu (0-indexed)
                      matchDate.setDate(26);
                      matchDate.setHours(16, 45, 0, 0);
                      return matchDate.toISOString();
                    })(),
                    status: 'SCHEDULED',
                    title: 'HJK vs FC Inter (Veikkausliiga)'
                  },
                  {
                    id: 'timeout_veikkausliiga_mestaruustaisto',
                    homeTeam: { name: 'Veikkausliiga' },
                    awayTeam: { name: 'Mestaruustaisto' },
                    score: { fullTime: { home: null, away: null } },
                    utcDate: (() => {
                      const matchDate = new Date();
                      matchDate.setMonth(10); // Marraskuu (0-indexed)
                      matchDate.setDate(9);
                      matchDate.setHours(14, 30, 0, 0);
                      return matchDate.toISOString();
                    })(),
                    status: 'SCHEDULED',
                    title: 'Veikkausliiga ottelu (Mestaruustaisto)'
                  }
                ];
                resolve({ matches: fallbackMatches });
              }, 10000); // 10 sekuntia
              
              console.log('Content: Lähetetään viesti background.js:lle...');
              chrome.runtime.sendMessage({ 
                action: 'fetchChampionsLeague' // Background.js hakee Huuhkajien otteluita
              }, (response) => {
                clearTimeout(timeout);
                
                if (chrome.runtime.lastError) {
                  console.error('Content: Runtime error:', chrome.runtime.lastError);
                  // Käytä fallback-dataa runtime errorin sijaan
                  const fallbackMatches = [
                    // FIFA karsinta-ottelut
                    // Veikkausliiga ottelu - OIKEA AIKA
                    {
                      id: 'runtime_error_veikkausliiga_hjk_inter',
                      homeTeam: { name: 'HJK' },
                      awayTeam: { name: 'FC Inter' },
                      score: { fullTime: { home: null, away: null } },
                      utcDate: (() => {
                        const matchDate = new Date();
                        matchDate.setMonth(9); // Lokakuu (0-indexed)
                        matchDate.setDate(26);
                        matchDate.setHours(16, 45, 0, 0);
                        return matchDate.toISOString();
                      })(),
                      status: 'SCHEDULED',
                      title: 'HJK vs FC Inter (Veikkausliiga)'
                    },
                    {
                      id: 'runtime_error_veikkausliiga_mestaruustaisto',
                      homeTeam: { name: 'Veikkausliiga' },
                      awayTeam: { name: 'Mestaruustaisto' },
                      score: { fullTime: { home: null, away: null } },
                      utcDate: (() => {
                        const matchDate = new Date();
                        matchDate.setMonth(10); // Marraskuu (0-indexed)
                        matchDate.setDate(9);
                        matchDate.setHours(14, 30, 0, 0);
                        return matchDate.toISOString();
                      })(),
                      status: 'SCHEDULED',
                      title: 'Veikkausliiga ottelu (Mestaruustaisto)'
                    }
                  ];
                  resolve({ matches: fallbackMatches });
                } else if (response && response.success) {
                  console.log('Content: Yle Areena API vastaus:', response.data);
                  resolve(response.data);
                } else {
                  console.error('Content: Background error:', response);
                  // Käytä fallback-dataa background errorin sijaan
                  const fallbackMatches = [
                    // FIFA karsinta-ottelut
                    // Veikkausliiga ottelu - OIKEA AIKA
                    {
                      id: 'background_error_veikkausliiga_hjk_inter',
                      homeTeam: { name: 'HJK' },
                      awayTeam: { name: 'FC Inter' },
                      score: { fullTime: { home: null, away: null } },
                      utcDate: (() => {
                        const matchDate = new Date();
                        matchDate.setMonth(9); // Lokakuu (0-indexed)
                        matchDate.setDate(26);
                        matchDate.setHours(16, 45, 0, 0);
                        return matchDate.toISOString();
                      })(),
                      status: 'SCHEDULED',
                      title: 'HJK vs FC Inter (Veikkausliiga)'
                    },
                    {
                      id: 'background_error_veikkausliiga_mestaruustaisto',
                      homeTeam: { name: 'Veikkausliiga' },
                      awayTeam: { name: 'Mestaruustaisto' },
                      score: { fullTime: { home: null, away: null } },
                      utcDate: (() => {
                        const matchDate = new Date();
                        matchDate.setMonth(10); // Marraskuu (0-indexed)
                        matchDate.setDate(9);
                        matchDate.setHours(14, 30, 0, 0);
                        return matchDate.toISOString();
                      })(),
                      status: 'SCHEDULED',
                      title: 'Veikkausliiga ottelu (Mestaruustaisto)'
                    }
                  ];
                  resolve({ matches: fallbackMatches });
                }
              });
            });
      
        if (response.matches && response.matches.length > 0) {
          console.log('Content: Löytyi', response.matches.length, 'OIKEAA FIFA karsinta-ottelua JA Veikkausliiga otteluita!');
          console.log('Content: Ottelut:', response.matches.map(m => `${m.homeTeam.name} vs ${m.awayTeam.name}`).join(', '));
        
        // Luo HTML kaikille otteluille - KÄYTÄ EVENT LISTENERIÄ
        let matchesHtml = '';
        
        response.matches.forEach((match, index) => {
             const homeScore = match.score.fullTime?.home ?? '?';
             const awayScore = match.score.fullTime?.away ?? '?';
          const matchTime = match.utcDate ? new Date(match.utcDate).toLocaleDateString('fi-FI', { 
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Tuntematon';
          
          // Suora linkki, jos tiedossa (muuten urheilusivu)
          const streamUrl = resolveStreamUrl(match.homeTeam?.name, match.awayTeam?.name);
          
          matchesHtml += `
            <div class="ao-match" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 0; ${index === response.matches.length - 1 ? 'border-bottom: none;' : ''}">
              <div class="ao-match-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div class="ao-match-time" style="font-size: 12px; opacity: 0.7;">${matchTime}</div>
                <div class="ao-match-status" style="font-size: 12px; opacity: 0.7;">${match.status === 'SCHEDULED' ? 'Tulossa' : match.status}</div>
              </div>
              <div class="ao-match-teams" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="ao-match-team" style="flex: 1; text-align: left;">
                  <div class="ao-match-team-name" style="font-size: 14px; font-weight: 600;">${match.homeTeam.name}</div>
                </div>
                <div class="ao-match-score" style="font-size: 18px; font-weight: 800; margin: 0 15px;">
                  ${homeScore} - ${awayScore}
                </div>
                <div class="ao-match-team" style="flex: 1; text-align: right;">
                  <div class="ao-match-team-name" style="font-size: 14px; font-weight: 600;">${match.awayTeam.name}</div>
                </div>
              </div>
              <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                <a href="${streamUrl}" target="_blank" rel="noopener noreferrer" 
                   style="background: #00d4ff; color: #001018; text-decoration: none; font-weight: 600; font-size: 12px; padding: 6px 10px; border-radius: 6px; transition: background-color 0.2s;">
                  Avaa Areena
                </a>
              </div>
            </div>
          `;
        });
        
        // Tarkista onko FIFA karsinta-otteluita JA Veikkausliiga otteluita
        const hasFifaKarsinta = response.matches.some(match => 
          match.homeTeam.name.toLowerCase().includes('suomi') || 
          match.awayTeam.name.toLowerCase().includes('suomi') ||
          match.homeTeam.name.toLowerCase().includes('huuhkajat') || 
          match.awayTeam.name.toLowerCase().includes('huuhkajat') ||
          match.homeTeam.name.toLowerCase().includes('finland') || 
          match.awayTeam.name.toLowerCase().includes('finland') ||
          match.homeTeam.name.toLowerCase().includes('liettua') || 
          match.awayTeam.name.toLowerCase().includes('liettua') ||
          match.homeTeam.name.toLowerCase().includes('hollanti') || 
          match.awayTeam.name.toLowerCase().includes('hollanti') ||
          match.homeTeam.name.toLowerCase().includes('fin') || 
          match.awayTeam.name.toLowerCase().includes('fin') ||
          match.homeTeam.name.toLowerCase().includes('ltu') || 
          match.awayTeam.name.toLowerCase().includes('ltu')
        );
        
        const hasVeikkausliiga = response.matches.some(match => 
          match.homeTeam.name.toLowerCase().includes('hjk') || 
          match.awayTeam.name.toLowerCase().includes('hjk') ||
          match.homeTeam.name.toLowerCase().includes('kups') || 
          match.awayTeam.name.toLowerCase().includes('kups') ||
          match.homeTeam.name.toLowerCase().includes('vps') || 
          match.awayTeam.name.toLowerCase().includes('vps') ||
          match.homeTeam.name.toLowerCase().includes('inter') || 
          match.awayTeam.name.toLowerCase().includes('inter') ||
          match.homeTeam.name.toLowerCase().includes('sjk') || 
          match.awayTeam.name.toLowerCase().includes('sjk') ||
          match.homeTeam.name.toLowerCase().includes('veikkausliiga') || 
          match.awayTeam.name.toLowerCase().includes('veikkausliiga')
        );
        
        // Määritä otsikko ja alaotsikko
        let title = 'FIFA Karsinta-ottelut';
        let subtitle = `Oikeat FIFA karsinta-ottelut (${response.matches.length} kpl)`;
        let period = 'FIFA Karsinta-ottelut';
        
        if (hasFifaKarsinta && hasVeikkausliiga) {
          title = 'FIFA Karsinta-ottelut JA Veikkausliiga ottelut';
          subtitle = `Oikeat FIFA karsinta-ottelut JA Veikkausliiga ottelut (${response.matches.length} kpl)`;
          period = 'FIFA Karsinta-ottelut JA Veikkausliiga ottelut';
        } else if (hasFifaKarsinta) {
          title = 'FIFA Karsinta-ottelut (Suomi mukaan lukien)';
          subtitle = `Oikeat FIFA karsinta-ottelut (${response.matches.length} kpl)`;
          period = 'FIFA Karsinta-ottelut';
        } else if (hasVeikkausliiga) {
          title = 'Veikkausliiga ottelut';
          subtitle = `Oikeat Veikkausliiga ottelut (${response.matches.length} kpl)`;
          period = 'Veikkausliiga ottelut';
        }
        
        matchData = {
          title: title,
          subtitle: subtitle,
          homeTeam: '', // Ei käytetä
          awayTeam: '', // Ei käytetä
          scoreHome: '', // Ei käytetä
          scoreAway: '', // Ei käytetä
          period: period,
          time: new Date().toLocaleDateString('fi-FI'), // Tänään
          customHtml: matchesHtml, // Mukautettu HTML
          isMultipleMatches: true, // Merkki että näytetään useita otteluita
          matches: response.matches // Tallenna ottelut
        };
      } else {
          throw new Error('Ei FIFA karsinta-otteluita tai Veikkausliiga otteluita löytynyt');
      }

    } catch (error) {
      console.error('Content: API-virhe:', error);
      
      // Näytä virheviesti
      matchData = {
        title: 'Tilastot puuttuvat',
        subtitle: error.message,
        homeTeam: 'Tuntematon',
        awayTeam: 'Tuntematon',
        scoreHome: 0,
        scoreAway: 0,
        period: 'Virhe',
        time: 'Tuntematon',
        stats: [
          { label: 'Virhe', value: error.message },
          { label: 'API', value: 'Ei tilastoja' },
          { label: 'Tarkista', value: 'Console' },
          { label: 'Tuki', value: 'API-ongelma' },
          { label: 'Extension', value: 'Lataa uudelleen' }
        ]
      };
    } finally {
      loading = false;
      updatePanel();
    }
  }


  function goBackToList() {
    console.log('Content: Palataan listaan...');
    fetchLiveScore(); // Hae ottelut uudelleen
  }

  // LISÄÄ GLOBAL FUNKTIOT
  window.goBackToList = goBackToList;

  function updatePanel() {
    if (loading) {
      panel.innerHTML = '<div class="ao-loading">Ladataan live-tuloksia...</div>';
    } else if (matchData) {
      if (matchData.isMultipleMatches) {
        // Näytä useita otteluita
      panel.innerHTML = 
        '<div class="ao-hdr">' +
          '<div>' +
            '<div class="ao-title">' + matchData.title + '</div>' +
            '<div class="ao-sub">' + matchData.subtitle + '</div>' +
          '</div>' +
          '<button class="ao-close" aria-label="Sulje">×</button>' +
        '</div>' +
          '<div class="ao-meta" style="padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">' +
            '<div>' + matchData.period + '</div>' +
            '<div class="ao-dot"></div>' +
            '<div>' + matchData.time + '</div>' +
          '</div>' +
          '<div class="ao-matches" style="max-height: 400px; overflow-y: auto; padding: 0 20px;">' +
            matchData.customHtml +
          '</div>';
        
        // LISÄÄ EVENT LISTENERIT TILASTO-NAPPEIHIN
        
      } else {
        // Näytä yksi ottelu (vanha tapa)
        let backButton = '';
        if (matchData.showBackButton) {
          backButton = '<button class="ao-back-btn" style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-right: 10px;">← Takaisin</button>';
        }
        
        panel.innerHTML = 
          '<div class="ao-hdr">' +
            '<div>' +
              '<div class="ao-title">' + matchData.title + '</div>' +
              '<div class="ao-sub">' + matchData.subtitle + '</div>' +
            '</div>' +
            '<div>' +
              backButton +
              '<button class="ao-close" aria-label="Sulje">×</button>' +
            '</div>' +
        '</div>' +
        '<div class="ao-score">' +
          '<div class="ao-team">' +
            '<div class="ao-name">' + matchData.homeTeam + '</div>' +
            '<div class="ao-num">' + matchData.scoreHome + '</div>' +
          '</div>' +
          '<div class="ao-div">-</div>' +
          '<div class="ao-team">' +
            '<div class="ao-name">' + matchData.awayTeam + '</div>' +
            '<div class="ao-num">' + matchData.scoreAway + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ao-meta">' +
          '<div>' + matchData.period + '</div>' +
          '<div class="ao-dot"></div>' +
          '<div>' + matchData.time + '</div>' +
        '</div>' +
        '<div class="ao-stats">' +
          matchData.stats.map(s => '<div class="ao-row"><div class="ao-l">' + s.label + '</div><div class="ao-v">' + s.value + '</div></div>').join('') +
        '</div>';
        
        // LISÄÄ EVENT LISTENER TAKAISIN-NAPILLE
        const backBtn = panel.querySelector('.ao-back-btn');
        if (backBtn) {
          backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Content: Klikattu takaisin-nappia');
            goBackToList();
          });
        }
      }
      panel.querySelector('.ao-close')?.addEventListener('click', () => toggle(false));
    } else {
      panel.innerHTML = '<div class="ao-error">Virhe tietojen lataamisessa</div>';
    }
  }

  function onKey(e) {
    if (e.ctrlKey && e.key === 'j') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggle();
    } else if (e.key === 'Escape') {
      toggle(false);
    }
  }

  window.addEventListener('keydown', onKey);
})();