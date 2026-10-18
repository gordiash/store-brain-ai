import dotenv from 'dotenv';
dotenv.config();

const INSTAGRAM_ACCOUNT_ID = process.env.IG_ACCOUNT_ID || '17841428136710713';

/**
 * Publikuje zdjęcie z opisem na Twoim profilu Instagram za pomocą Meta Graph API.
 * @param {string} imageUrl - Publiczny link HTTPS do zdjęcia (np. zdjęcia produktu ze sklepu WooCommerce)
 * @param {string} caption - Treść opisu posta (wraz z hashtagami)
 * @param {string} pageToken - Ten sam Token Page Access Token (domyślnie pobierany z .env)
 */
export async function publishToInstagram(imageUrl, caption, pageToken = process.env.FB_PAGE_TOKEN) {
  if (INSTAGRAM_ACCOUNT_ID === 'TWÓJ_INSTAGRAM_ACCOUNT_ID' || !INSTAGRAM_ACCOUNT_ID || !pageToken) {
    console.log("[Instagram System] Brak skonfigurowanego INSTAGRAM_ACCOUNT_ID lub FB_PAGE_TOKEN. Działanie w trybie symulacji.");
    return { id: "mock_ig_" + Math.random().toString(36).substring(7), message: "Zasymulowano wpis na IG" };
  }

  try {
    // KROK 1: Utworzenie kontenera ze zdjęciem i opisem
    const containerUrl = `https://graph.facebook.com/v20.0/${INSTAGRAM_ACCOUNT_ID}/media`;
    const containerRes = await fetch(containerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: pageToken
      })
    });

    const containerData = await containerRes.json();
    if (containerData.error) {
      throw new Error(`Błąd tworzenia kontenera IG: ${containerData.error.message}`);
    }

    const creationId = containerData.id;

    // Odczekajmy 4 sekundy, aż serwery Meta przetworzą zdjęcie w kontenerze
    await new Promise(resolve => setTimeout(resolve, 4000));

    // KROK 2: Opublikowanie utworzonego kontenera na profilu Instagram
    const publishUrl = `https://graph.facebook.com/v20.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: pageToken
      })
    });

    const publishData = await publishRes.json();
    if (publishData.error) {
      throw new Error(`Błąd publikacji kontenera IG: ${publishData.error.message}`);
    }

    console.log("[Instagram System] Pomyślnie opublikowano post na Instagramie! ID:", publishData.id);
    return publishData;

  } catch (error) {
    console.error("[Instagram System] Błąd publikacji na IG:", error.message);
    throw error;
  }
}

/**
 * Publikuje gotowy plik wideo MP4 jako ROLKĘ (Reel) na Twoim profilu Instagram.
 * @param {string} videoUrl - Bezpośredni publiczny link HTTPS do pliku wideo MP4 w formacie 9:16
 * @param {string} caption - Treść opisu Rolki wraz z hashtagami wygenerowanymi przez Gemini AI
 * @param {string} pageToken - Token dostępowy Meta API
 */
export async function publishReelToInstagram(videoUrl, caption, pageToken = process.env.FB_PAGE_TOKEN, fallbackImageUrl = null) {
  if (INSTAGRAM_ACCOUNT_ID === 'TWÓJ_INSTAGRAM_ACCOUNT_ID' || !INSTAGRAM_ACCOUNT_ID || !pageToken) {
    console.log("[Instagram Reels System] Brak kluczy API. Tryb symulacji Rolki.");
    return { id: "mock_reel_" + Math.random().toString(36).substring(7), message: "Zasymulowano publikację Rolki na IG" };
  }

  const safePhotoUrl = fallbackImageUrl || "https://dummyimage.com/1080x1080/ff75a0/ffffff.jpg";

  try {
    // KROK 1: Utworzenie kontenera wideo REELS
    const containerUrl = `https://graph.facebook.com/v20.0/${INSTAGRAM_ACCOUNT_ID}/media`;
    const containerRes = await fetch(containerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: videoUrl,
        caption: caption,
        access_token: pageToken
      })
    });

    const containerData = await containerRes.json();
    if (containerData.error) {
      console.log("[Instagram Reels] Brak możliwości utworzenia kontenera wideo. Przełączanie na bezpieczny wpis ze zdjęciem.");
      return await publishToInstagram(safePhotoUrl, caption, pageToken);
    }

    const creationId = containerData.id;

    // KROK 1.5: Pętla odpytująca status kodowania wideo na serwerach Meta (do 20 prób = max 80s)
    let isReady = false;
    let attempts = 0;
    
    while (!isReady && attempts < 20) {
      attempts++;
      console.log(`[Instagram Reels Status] Sprawdzanie stanu kodowania wideo przez Meta (Próba ${attempts}/20)...`);
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      try {
        const statusUrl = `https://graph.facebook.com/v20.0/${creationId}?fields=status_code,status&access_token=${pageToken}`;
        const statusRes = await fetch(statusUrl);
        const statusData = await statusRes.json();
        
        console.log(`[Instagram Reels Status] Status kontenera (${creationId}): ${statusData.status_code || 'W TRAKCIE KODOWANIA'}`);
        
        if (statusData.status_code === 'FINISHED') {
          isReady = true;
          break;
        } else if (statusData.status_code === 'ERROR') {
          console.error(`[Instagram Reels Error] Meta zgłosił błąd przetwarzania wideo:`, statusData.status);
          break;
        }
      } catch (err) {
        console.log("[Instagram Reels Status] Oczekiwanie na finalizację kodowania przez Meta...");
      }
    }

    if (!isReady) {
      console.log("[Instagram Reels] Kodowanie wideo nie zakończyło się w czasie. Przełączanie na bezpieczną publikację ze zdjęciem produktu.");
      return await publishToInstagram(safePhotoUrl, caption, pageToken);
    }

    // KROK 2: Publikacja przetworzonej Rolki na profilu Instagram
    const publishUrl = `https://graph.facebook.com/v20.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: pageToken
      })
    });

    const publishData = await publishRes.json();
    if (publishData.error) {
      console.log("[Instagram Reels] Meta odrzucił wideo Rolki. Przełączanie na publikację ze zdjęciem produktu.");
      return await publishToInstagram(safePhotoUrl, caption, pageToken);
    }

    console.log("[Instagram Reels] Pomyślnie opublikowano ROLKĘ (REEL) na Instagramie! ID:", publishData.id);
    return publishData;

  } catch (error) {
    console.log("[Instagram Reels] Przełączanie na bezpieczny wpis ze zdjęciem dla produktu...");
    return await publishToInstagram(safePhotoUrl, caption, pageToken);
  }
}
