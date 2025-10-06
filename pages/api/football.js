export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const API_KEY = '31277e10b0b14a04af4c55c3da09eeb7';
    
    console.log('API: Haetaan Champions League -otteluita...');
    
    // Hae vain 1. lokakuuta 2025 otteluita
    const october1_2025 = '2025-10-01'; // 1. lokakuuta 2025
    
    console.log('API: Haetaan otteluita päivältä:', october1_2025);
    
    const response = await fetch(`https://api.football-data.org/v4/competitions/CL/matches?dateFrom=${october1_2025}&dateTo=${october1_2025}`, {
      headers: {
        'X-Auth-Token': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Football-data.org API-virhe: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API: API-vastaus:', data);
    
    if (data.matches && data.matches.length > 0) {
      console.log('API: Löytyi', data.matches.length, 'Champions League -ottelua 1. lokakuuta 2025');
      
      res.status(200).json({
        matches: data.matches
      });
    } else {
      throw new Error('Ei Champions League -otteluita löytynyt 1. lokakuuta 2025');
    }
    
  } catch (error) {
    console.error('API: Football-data.org API-virhe:', error);
    res.status(500).json({ error: error.message });
  }
} 