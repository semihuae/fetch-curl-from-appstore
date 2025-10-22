// Bu dosya Vercel Serverless Function olarak çalışmak üzere tasarlanmıştır.
// Vercel projenizin kök dizinindeki /api/ klasörüne kaydedilmelidir.

const fetch = require('node-fetch'); // Vercel ortamında 'fetch' mevcut olabilir, ancak node-fetch daha güvenlidir.

// API Anahtarı, Vercel Ortam Değişkenlerinden (Environment Variables) alınır.
// Lütfen Vercel panelinizde SERPAPI_KEY adında bir değişken tanımlayın.
const SERPAPI_KEY = process.env.SERPAPI_KEY;

// SERPAPI Endpoint
const API_BASE_URL = 'https://serpapi.com/search';

// Bu fonksiyon, Vercel'in '/api/app-search' endpoint'i için handler'dır.
module.exports = async (req, res) => {
    // Sadece GET isteğini kabul et
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { term } = req.query;

    if (!term) {
        return res.status(400).json({ error: 'Arama terimi (term) eksik.' });
    }

    if (!SERPAPI_KEY) {
        return res.status(500).json({ error: 'Sunucu hatası: SerpApi anahtarı Vercel ortam değişkenlerinde tanımlı değil.' });
    }

    try {
        // SerpApi Query Parametreleri
        const params = new URLSearchParams({
            api_key: SERPAPI_KEY,
            engine: "apple_app_store",
            term: term,
            country: "us",
            lang: "en-us",
            num: "1"
        });
        
        const url = `${API_BASE_URL}?${params.toString()}`;

        // Doğrudan SerpApi'ye sunucu tarafı çağrısı
        const serpResponse = await fetch(url);

        // SerpApi'den gelen yanıtı istemciye geri gönder
        if (!serpResponse.ok) {
            const errorText = await serpResponse.text();
            return res.status(serpResponse.status).json({
                error: `SerpApi hatası: ${serpResponse.statusText}`,
                details: errorText
            });
        }

        const data = await serpResponse.json();
        
        // CORS hatası olmadığı için, sadece JSON verisini gönderiyoruz.
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: 'Sunucu iç hatası: SerpApi çağrısı başarısız oldu.' });
    }
};

