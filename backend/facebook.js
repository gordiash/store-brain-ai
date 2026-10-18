import dotenv from 'dotenv';
dotenv.config();

const PAGE_TOKEN = process.env.FB_PAGE_TOKEN || 'TWÓJ_TOKEN_PAGE_ACCESS_TOKEN';
const PAGE_ID = process.env.FB_PAGE_ID || '1082888234909700';

/**
 * Publikuje wpis ze zdjęciem lub tekstowy na tablicy Fanpage'a na Facebooku.
 * @param {string} message - Treść posta do opublikowania
 * @param {string} imageUrl - Opcjonalny bezpośredni adres URL zdjęcia produktu
 * @returns {Promise<Object>} - Odpowiedź z API Facebooka
 */
export async function publishToFacebook(message, imageUrl = null) {
  // Jeśli użytkownik nie podał jeszcze klucza, działamy w trybie symulacji
  if (PAGE_TOKEN === 'TWÓJ_TOKEN_PAGE_ACCESS_TOKEN' || !PAGE_TOKEN) {
    console.log("[Facebook System] Brak skonfigurowanego klucza. Działanie w trybie testowym (symulacja).");
    return { id: "mock_fb_" + Math.random().toString(36).substring(7), message: "Zasymulowano wpis na FB" };
  }

  // Jeśli jest podane zdjęcie, używamy endpointu /photos z parametrem caption
  const isPhotoPost = Boolean(imageUrl);
  const endpoint = isPhotoPost ? 'photos' : 'feed';
  const url = `https://graph.facebook.com/v20.0/${PAGE_ID}/${endpoint}`;

  const payload = isPhotoPost
    ? { url: imageUrl, caption: message, access_token: PAGE_TOKEN }
    : { message: message, access_token: PAGE_TOKEN };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    console.log(`[Facebook System] Pomyślnie opublikowano post (${isPhotoPost ? 'ZE ZDJĘCIEM' : 'TEKSTOWY'}) o ID:`, data.id || data.post_id);
    return data;
  } catch (error) {
    console.error("[Facebook System] Błąd podczas publikacji:", error.message);
    throw error;
  }
}