import fs from 'fs';

const GEMINI_API_KEY = "AIzaSyC_Nme3gkfBldPnpuGOZs2TtmJ92mj0sXk";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// 1x1 transparent PNG base64
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const mimeType = "image/png";

async function test() {
  const prompt = `
Bu fotoğraftaki yiyecek/içeceği analiz et.
Türkiye'deki standart porsiyon miktarına göre besin değerlerini hesapla.
SADECE aşağıdaki JSON formatında yanıt ver:

{
  "name": "Yemeğin Türkçe adı",
  "calories": 250,
  "protein": 12.5,
  "carbs": 30.0,
  "fat": 8.0,
  "fiber": 3.0,
  "servingSize": "1 porsiyon (tahmini)",
  "confidence": "medium"
}
`;
  
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType, data: base64Image } }
        ]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
    })
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
