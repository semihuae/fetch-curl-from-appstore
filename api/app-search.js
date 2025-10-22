// Bu dosya Vercel Serverless Function olarak çalışmak üzere tasarlanmıştır.
// Vercel projenizin kök dizinindeki /api/ klasörüne kaydedilmelidir.

// ÖNEMLİ DÜZELTME: Vercel'in yeni Node.js ortamlarında (Node 18+) global 'fetch' mevcuttur.
// Bu yüzden 'node-fetch' bağımlılığını (hata kaynağı) kaldırdık.
// const fetch = require('node-fetch'); // <-- BU SATIR KALDIRILDI

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

    // req.query Vercel'de URL'den parametreleri almak için kullanılır.
    const url = new URL(req.url, `http://${req.headers.host}`);
    const term = url.searchParams.get('term');

    if (!term) {
        return res.status(400).json({ error: 'Arama terimi (term) eksik.' });
    }

    if (!SERPAPI_KEY) {
        // Bu hata mesajı, frontend'deki hata yakalama mekanizması tarafından kontrol ediliyor.
        return res.status(500).json({ error: 'Sunucu hatası: SerpApi anahtarı Vercel ortam değişkenlerinde tanımlı değil.' });
    }

    try {
        // SerpApi Query Parametreleri oluşturuluyor
        const params = new URLSearchParams({
            api_key: SERPAPI_KEY,
            engine: "apple_app_store",
            term: term,
            country: "vn",
            lang: "en-us",
            num: "1"
        });
        
        const serpApiUrl = `${API_BASE_URL}?${params.toString()}`;

        // Global fetch API'si ile doğrudan SerpApi'ye sunucu tarafı çağrısı
        const serpResponse = await fetch(serpApiUrl);

        // SerpApi'den gelen yanıtı istemciye geri gönder
        if (!serpResponse.ok) {
            const errorText = await serpResponse.text();
            console.error('SerpApi Yanıt Hatası:', serpResponse.status, errorText);
            // SerpApi'nin döndürdüğü durumu ve mesajı iletmek daha iyidir.
            return res.status(serpResponse.status).json({ 
                error: `SerpApi sunucu hatası: Durum Kodu ${serpResponse.status}.`,
                details: errorText
            });
        }

        const data = await serpResponse.json();
        
        // Başarılı sonucu döndür
        return res.status(200).json(data);

    } catch (error) {
        console.error('Serverless Function Hata:', error);
        return res.status(500).json({ error: 'Sunucu iç hatası: SerpApi çağrısı sırasında beklenmedik bir hata oluştu.' });
    }
};
