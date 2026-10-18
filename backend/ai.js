import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const hasValidKey = apiKey && apiKey !== 'TUTAJ_WKLEJ_SWOJ_KLUCZ_GEMINI_API' && apiKey.trim() !== '';

const ai = hasValidKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generuje inteligentną treść za pomocą oficjalnego API Google Gemini.
 * @param {string} prompt - Instrukcja/zapytanie dla agenta
 * @param {string} modelName - Domyślnie 'gemini-3.5-flash'
 * @returns {Promise<string|null>} - Wygenerowany tekst lub null w przypadku braku klucza
 */
export async function generateContentAI(prompt, modelName = 'gemini-3.5-flash-lite') {
  if (!ai) {
    console.log("[Gemini AI] Brak aktywnego GEMINI_API_KEY. Działanie na wbudowanych szablonach.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.warn(`[Gemini AI] Błąd z symulowanym aliasem ${modelName}, próba z aktualnym modelem flash-lite:`, error.message);
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
      });
      return fallbackResponse.text;
    } catch (err2) {
      console.error("[Gemini AI] Błąd generowania odpowiedzi z Gemini:", err2.message);
      return null;
    }
  }
}
