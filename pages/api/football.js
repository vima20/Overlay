export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const API_KEY = '31277e10b0b14a04af4c55c3da09eeb7';
    
    // Hae menneitä Champions League -otteluita
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateFrom = yesterday.toISOString().split('T')[0];
    const dateTo = yesterday.toISOString().split('T')[0];
    
    console.log('Haetaan otteluita päivältä:', dateFrom);
    
    const response = await fetch(`https://api.football-data.org/v4/competitions/CL/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
      headers: {
        'X-Auth-Token': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API-virhe: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('API-vastaus:', data);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('API-virhe:', error);
    res.status(500).json({ error: error.message });
  }
}
