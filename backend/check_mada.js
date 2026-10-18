import fs from 'fs';

async function testLoginWithPassField() {
  console.log("1. Pobieranie sesji początkowej...");
  const init = await fetch("https://www.mada.pl/index1.php?a=log", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });

  const initCookies = init.headers.getSetCookie ? init.headers.getSetCookie() : [init.headers.get("set-cookie")];
  let cookieMap = {};
  initCookies.filter(Boolean).forEach(c => {
    const parts = c.split(';')[0].split('=');
    cookieMap[parts[0].trim()] = parts.slice(1).join('=');
  });

  const cookieHeader = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');

  console.log("2. Wysyłanie formularza z polem 'pass'...");
  const params = new URLSearchParams();
  params.append("login", "jaroslaw.jakubczyk@gmail.com");
  params.append("pass", "Mi1chA2le3k!");
  params.append("remember", "1");

  const loginRes = await fetch("https://www.mada.pl/index1.php?a=log", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Cookie": cookieHeader,
      "Referer": "https://www.mada.pl/index1.php?a=log"
    },
    body: params.toString(),
    redirect: "manual"
  });

  console.log("Status po logowaniu:", loginRes.status, loginRes.headers.get("location"));
  const newCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie")];
  newCookies.filter(Boolean).forEach(c => {
    const parts = c.split(';')[0].split('=');
    cookieMap[parts[0].trim()] = parts.slice(1).join('=');
  });

  const activeCookieHeader = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');

  console.log("3. Pobieranie strony głównej i sprawdzenie zalogowania...");
  const homeRes = await fetch("https://www.mada.pl/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Cookie": activeCookieHeader
    }
  });

  const homeHtml = await homeRes.text();
  const isLogged = homeHtml.includes("Wyloguj") || homeHtml.includes("wyloguj") || homeHtml.includes("Moje konto") || homeHtml.includes("jaroslaw");
  console.log("Czy zalogowano pomyślnie?", isLogged);

  console.log("4. Sprawdzanie https://www.mada.pl/xml.php ...");
  const xmlRes = await fetch("https://www.mada.pl/xml.php", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Cookie": activeCookieHeader
    }
  });

  console.log("Status xml.php:", xmlRes.status);
  const xmlHtml = await xmlRes.text();
  fs.writeFileSync("mada_xml_logged.html", xmlHtml, "utf-8");
  console.log("Zapisano mada_xml_logged.html (długość: " + xmlHtml.length + ")");

  // Szukamy linków do plików xml / csv / generowania feedu
  const links = [...xmlHtml.matchAll(/href="([^"]+)"/gi)].map(m => m[1]);
  const xmlLinks = links.filter(l => l.includes("xml") || l.includes("csv") || l.includes("feed") || l.includes("pobierz") || l.includes("export") || l.includes("plik"));
  console.log("Linki w xml.php:", xmlLinks);
  
  // Wyszukaj ewentualne teksty ze ścieżkami lub linkami
  const allUrls = xmlHtml.match(/https?:\/\/[^\s"'<>]+\.(?:xml|csv|php|zip)[^\s"'<>]*/gi) || [];
  console.log("Wszystkie URL-e do plików:", [...new Set(allUrls)]);
}

testLoginWithPassField().catch(console.error);
