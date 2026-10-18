import fs from 'fs';
import path from 'path';

export const BRAND_CONTEXT = {
  storeName: "Natura Intimo",
  domain: "naturaintimo.com",
  niche: "Ekskluzywna europejska bielizna damska, biustonosze full-bust (DD–M), figi, majtki brazyliany, komplety brafittingowe (rynki: USA, Kanada, Polska)",
  targetAudience: "Kobiety w USA, Kanadzie i Polsce ceniące europejską konstrukcję brafittingową, podtrzymanie dużego biustu, całodzienny komfort i precyzyjny dobór rozmiaru (EU ↔ US/UK)",
  topBrands: ["Gorsenia", "Gaia", "Ava", "Mefemi", "Alles"],
  toneOfVoice: "Ekspercki, ciepły, profesjonalny, skoncentrowany na komforcie, wsparciu konstrukcyjnym i pewności siebie (zgodny z wytycznymi FTC i obyczajowością US/CA)"
};

/**
 * Wczytuje oficjalny podręcznik Markdown (.md) przypisany do agenta.
 * @param {string} agentKey - Klucz agenta ('strategist', 'merchant', 'ceo', 'cmo', 'accountant', 'customer_care', 'tech_lead', 'compliance', 'instagram', 'facebook', 'blogger', 'reels_producer')
 * @returns {string} - Treść dokumentu .md
 */
export function getAgentDocumentation(agentKey) {
  try {
    const filePath = path.join(process.cwd(), 'agents_docs', `${agentKey}.md`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (err) {
    console.error(`[Doc Loader] Błąd wczytywania instrukcji dla agenta ${agentKey}:`, err.message);
  }
  return "";
}

/**
 * Wczytuje centralną konfigurację rynkową (Single Source of Truth) z backend/market_config.json.
 */
export function getMarketConfig() {
  try {
    const configPath = path.join(process.cwd(), 'market_config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (err) {
    console.error(`[Market Config Loader] Błąd wczytywania market_config.json:`, err.message);
  }
  return null;
}

export const AGENT_SKILLS = {
  merchant: [
    "🛍️ store-manager-sms",
    "🧵 Nadzór Składu i Pochodzenia (FTC Textile Act)",
    "🔄 Synchronizacja XML Hurtowni MADA",
    "📦 Realizacja Zamówień i Powiadomienia (FTC Mail Order Rule)",
    "📏 Konwersja Rozmiarów EU ↔ US/UK i Komplety"
  ],
  ceo: [
    "👑 ecommerce-ceo-sms",
    "📊 Ekonomika Jednostkowa i Marża DDP",
    "🗂️ Zarządzanie Single Source of Truth (market_config.json)",
    "🤖 Orkiestracja Zespołu 7 Agentów"
  ],
  cmo: [
    "📣 growth-marketing-ai-seo-sms",
    "🎬 Promocja Organiczna TikTok / IG Reels / FB / Pinterest",
    "🔍 Klasyczne E-Commerce SEO & Google Merchant JSON-LD",
    "🤖 AI SEO / GEO (/llms.txt, Answer-First, ChatGPT & Perplexity Citations)"
  ],
  accountant: [
    "🧾 accounting-export-customs-sms",
    "🇵🇱 Darmowa Integracja KSeF FA(3) & Kursy NBP API",
    "✈️ Commercial Invoice DHL Express & Kody HTS per Komponent",
    "🍁 Deklaracje Pochodzenia CETA (0% Cła Kanada) & 0% VAT Eksport (IE-599)"
  ],
  customer_care: [
    "💬 brafitting-customer-care-sms",
    "📐 Wirtualny Brafitting (Cale/CM, Sister Sizes, Konstrukcje Marek)",
    "🔄 Obsługa Zwrotów i Wymian RMA (30 Dni US/CA, Free First Exchange)",
    "⭐ Zbieranie Zweryfikowanych Opinii (FTC Consumer Reviews Rule)"
  ],
  tech_lead: [
    "⚙️ tech-ux-security-sms",
    "🔒 Higiena Bezpieczeństwa .env & Automatyczne Backupy",
    "🌐 Separacja Językowa (/en/, fr-CA) i Walutowa (USD, CAD, PLN)",
    "♿ Dostępność Cyfrowa ADA / WCAG 2.2 AA & Core Web Vitals"
  ],
  compliance: [
    "⚖️ us-ca-compliance-auditor-sms",
    "🛡️ Audyt FTC Truth-in-Advertising & California SB 478 Honest Pricing",
    "🍁 Zgodność Kanadyjska (Ontario/Quebec CPA, Bill 96, Law 25, CASL)",
    "🇪🇺 RODO + CCPA Global Privacy Control (GPC)"
  ],
  strategist: [
    "🧠 Analiza Marżowości 0 PLN",
    "📈 Strategia Zasięgu Organicznego US/CA/PL",
    "🎯 Targetowanie Niszy Full Bust DD–M"
  ],
  instagram: [
    "📸 Posty ze Zdjęciami HD",
    "🎬 Rolki Reels (Hook 3s)",
    "🎯 Instagram SEO & Explore",
    "🏷️ Niszowy Hashtag Matrix"
  ],
  facebook: [
    "👥 Viral Marketing Grupowy",
    "💬 Pętla Zasięgu Komentarzy",
    "✨ Storytelling & Brafitting",
    "📸 Fotografie Meta HD"
  ],
  blogger: [
    "✍️ Poradniki Brafittingowe Answer-First (AI SEO)",
    "🌐 Publikacja WordPress REST API + FAQPage Schema",
    "🛡️ Ochrona Anty-Spamowa WP"
  ],
  reels_producer: [
    "🪝 hook-writer-sms",
    "✍️ caption-writer-sms",
    "🔄 content-repurposer-sms",
    "📱 platform-strategy-sms",
    "🎬 Animacja Wyrazista 9:16",
    "🎞️ Renderowanie MP4"
  ]
};

/**
 * Generuje wzbogacony prompt wraz z pełną instrukcją Markdown agenta i regułami rynkowymi.
 * @param {string} agentKey - Klucz agenta
 * @param {string} taskPrompt - Zapytanie/zadanie do wykonania
 * @returns {string} - Kompletny prompt z konfiguracyjnym systemowym kontekstem
 */
export function buildEnrichedPrompt(agentKey, taskPrompt) {
  const mdDoc = getAgentDocumentation(agentKey);
  const skills = AGENT_SKILLS[agentKey] ? AGENT_SKILLS[agentKey].join(", ") : "";
  const marketConfig = getMarketConfig();
  const forbiddenTerms = marketConfig?.complianceBlacklists?.forbiddenMarketingTerms?.join(", ") || "";

  return `
[SYSTEM CONTEXT & BRAND IDENTITY]
Marka: ${BRAND_CONTEXT.storeName} (${BRAND_CONTEXT.domain})
Branża: ${BRAND_CONTEXT.niche}
Grupa docelowa: ${BRAND_CONTEXT.targetAudience}
Ton wypowiedzi: ${BRAND_CONTEXT.toneOfVoice}
Bezwzględnie zakazane zwroty (FTC / Compliance Blacklist): ${forbiddenTerms}

[OBLIGATORYJNY PODRĘCZNIK WYKONAWCZY AGENTA (.MD)]
${mdDoc}

Aktywne umiejętności specjalistyczne: ${skills}

[ZADANIE DO WYKONANIA (BEZWZGLĘDNIE PRZESTRZEGAJ WYTYCZNYCH Z PLIKU .MD ORAZ AGENTS.MD)]
${taskPrompt}
  `.trim();
}
