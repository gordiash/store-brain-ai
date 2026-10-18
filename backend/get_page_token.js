// backend/get_page_token.js
import dotenv from 'dotenv';
dotenv.config();

const CURRENT_TOKEN = process.env.FB_PAGE_TOKEN;
const PAGE_ID = process.env.FB_PAGE_ID || '1082888234909700';

console.log("=== POBIERANIE WŁAŚCIWEGO PAGE ACCESS TOKEN DLA STRONY ===");

async function getPageToken() {
  if (!CURRENT_TOKEN) {
    console.log("❌ Brak FB_PAGE_TOKEN w pliku .env");
    process.exit(1);
  }

  try {
    // Odpytujemy API Meta o listę Stron zarządzanych przez dany Token
    const url = `https://graph.facebook.com/v20.0/me/accounts?access_token=${CURRENT_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.log("❌ Błąd pobierania tokenu strony:", data.error.message);
      process.exit(1);
    }

    if (data.data && data.data.length > 0) {
      console.log(`\n✅ Znaleziono ${data.data.length} Stron(y) powiązane z Twoim kontem:`);
      let foundToken = null;

      data.data.forEach(page => {
        console.log(`- Strona: "${page.name}" (ID: ${page.id})`);
        if (page.id === PAGE_ID || page.name.toLowerCase().includes('natura')) {
          foundToken = page.access_token;
          console.log(`  👉 ZNALAZŁEM TOKEN DLA TWOJEJ STRONY: ${page.name}`);
        }
      });

      if (foundToken) {
        console.log("\nOto właściwy PAGE ACCESS TOKEN (Token Strony) do wklejenia w .env:");
        console.log(foundToken);
      }
    } else {
      console.log("\n⚠️ Wygenerowany token jest Tokenem Użytkownika, a nie Tokenem Strony, lub nie wybrano Strony Natura Intimo przy generowaniu.");
    }
  } catch (err) {
    console.error("Błąd połączenia z API Facebooka:", err.message);
  }
}

getPageToken();
