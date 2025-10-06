export default async function handler(req, res) {
  try {
    const API_KEY = '31277e10b0b14a04af4c55c3da09eeb7';
    
    console.log('API: Haetaan Champions League -otteluita...');
    
    // Hae menneitä otteluita (viime viikko)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const dateFrom = lastWeek.toISOString().split('T')[0];
    const dateTo = today.toISOString().split('T')[0];
    
    console.log('API: Haetaan otteluita päiviltä:', dateFrom, 'to', dateTo);
    
    const response = await fetch(`https://api.football-data.org/v4/competitions/CL/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
      headers: {
        'X-Auth-Token': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API: Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('API: Error response:', errorText);
      throw new Error(`Football-data.org API-virhe: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API: API-vastaus:', data);
    
    if (data.matches && data.matches.length > 0) {
      console.log('API: Löytyi', data.matches.length, 'Champions League -ottelua');
      
      res.status(200).json({
        matches: data.matches
      });
    } else {
      // Jos ei menneitä otteluita, hae tulevia
      console.log('API: Ei menneitä otteluita, haetaan tulevia...');
      
      const futureResponse = await fetch(`https://api.football-data.org/v4/competitions/CL/matches?dateFrom=${today.toISOString().split('T')[0]}&dateTo=${new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`, {
        headers: {
          'X-Auth-Token': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (futureResponse.ok) {
        const futureData = await futureResponse.json();
        if (futureData.matches && futureData.matches.length > 0) {
          console.log('API: Löytyi', futureData.matches.length, 'tulevaa Champions League -ottelua');
          res.status(200).json({
            matches: futureData.matches
          });
        } else {
          throw new Error('Ei Champions League -otteluita löytynyt');
        }
      } else {
        throw new Error('Ei Champions League -otteluita löytynyt');
      }
    }
    
  } catch (error) {
    console.error('API: Football-data.org API-virhe:', error);
    res.status(500).json({ error: error.message });
  }
}
