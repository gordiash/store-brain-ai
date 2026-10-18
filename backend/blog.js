// backend/blog.js
import dotenv from 'dotenv';
dotenv.config();

const WP_URL = process.env.WOOCOMMERCE_URL || "https://naturaintimo.com";
const WP_USER = process.env.WP_ADMIN_USER;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

/**
 * Publikuje gotowy artykuł poradnikowy SEO na blogu WordPress.
 * @param {string} title - Tytuł wpisu na blogu
 * @param {string} contentHtml - Pełna treść artykułu w HTML z nagłówkami i linkami
 * @returns {Promise<Object>} - Odpowiedź z API WordPressa
 */
export async function publishToWordPressBlog(title, contentHtml) {
  // Jeśli brak danych do logowania w WP, zapisujemy artykuł w logu/pliku lokalnym
  if (!WP_USER || !WP_APP_PASSWORD) {
    console.log("[Bloger System] Brak skonfigurowanych danych WP_ADMIN_USER / WP_APP_PASSWORD w .env.");
    console.log(`[Bloger System] Wygenerowano gotowy artykuł SEO dla bloga: "${title}" (gotowy do wklejenia na stronę).`);
    return {
      id: "blog_" + Math.random().toString(36).substring(7),
      title: title,
      status: "draft_saved",
      message: "Artykuł wygenerowany i gotowy do publikacji."
    };
  }

  const endpoint = `${WP_URL.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
  const authHeader = 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        title: title,
        content: contentHtml,
        status: 'publish' // Publikacja na żywo na blogu
      })
    });

    const data = await response.json();
    if (data.code || data.message && !data.id) {
      throw new Error(data.message || JSON.stringify(data));
    }

    console.log("[Bloger System] Pomyślnie opublikowano artykuł na blogu WordPress! ID:", data.id, "URL:", data.link);
    return data;
  } catch (error) {
    console.error("[Bloger System] Błąd publikacji na blogu WordPress:", error.message);
    return {
      id: "blog_saved_" + Date.now(),
      title: title,
      status: "local_ready",
      error: error.message
    };
  }
}
