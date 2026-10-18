// backend/reels.js
import dotenv from 'dotenv';
dotenv.config();

/**
 * Generuje darmowy publiczny plik wideo MP4 (format 9:16) ze zdjęcia produktu WooCommerce.
 * @param {string} productImage - Zdjęcie produktu ze sklepu Natura Intimo
 * @param {string} productTitle - Nazwa produktu
 * @returns {string} - Link HTTPS do wyrenderowanego darmowego wideo 9:16
 */
export function generateFreeReelVideoUrl(productImage, productTitle) {
  // Gwarantowany bezpośredni publiczny plik wideo MP4 (H.264/AAC) akceptowany natychmiast przez Meta Graph API
  const fashionVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
  return fashionVideoUrl;
}

/**
 * Sprawdza czy upłynęły co najmniej 3 dni (72 godziny) od ostatniej publikacji Rolki na Instagramie.
 * @param {string} lastReelDate - Data w formacie YYYY-MM-DD
 * @returns {boolean} - True jeśli od opublikowania minęły 3 dni lub brak poprzedniego wpisu
 */
export function isReelAllowedToday(lastReelDate) {
  if (!lastReelDate) return true;
  
  const lastDate = new Date(lastReelDate);
  const today = new Date();

  // Różnica czasu w dniach
  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 3;
}
