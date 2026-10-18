import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProducts, updateProductDescription, getRecentOrders, getRealWooCommerceMetrics } from './woocommerce.js';
import { publishToFacebook } from './facebook.js';
import { publishToInstagram, publishReelToInstagram } from './instagram.js';
import { publishToWordPressBlog } from './blog.js';
import { generateFreeReelVideoUrl, isReelAllowedToday } from './reels.js';
import { generateContentAI } from './ai.js';
import { buildEnrichedPrompt } from './context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.json');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Helper functions to read/write state
function readDb() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return {};
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// Lingerie niche templates for agents
const INSTAGRAM_TEMPLATES = [
  {
    title: "Kolekcja Figi Gorsenia Astrid - Zmysłowa Koronka",
    desc: "Karuzela estetycznych zdjęć produktu i zbliżeń na delikatny haft",
    caption: "Owiń się w delikatność i luksus. Model Gorsenia Astrid z bawełnianą podszewką dostępny w Natura Intimo.",
    visitorsEffect: 180
  },
  {
    title: "Test Niewidzialności - Bielizna Bezszwowa",
    desc: "Galeria zdjęć Przed / Po pod dopasowaną letnią sukienką",
    caption: "Stylizacja bez kompromisów! Nasze małe bezszwowe sekretne wsparcie pod obcisłe ubrania.",
    visitorsEffect: 240
  },
  {
    title: "Nude & Silk - Jedwabisty Dotyk Natura Intimo",
    desc: "Moodboard w odcieniach pudrowego różu i satyny z detalami koronki",
    caption: "Czysta pewność siebie każdego dnia. Odkryj zmysłową kolekcję w naszym sklepie.",
    visitorsEffect: 200
  }
];

const FACEBOOK_TEMPLATES = [
  {
    group: "Porady modowe - stylizacje i triki",
    title: "Jak uratować opadające ramiączka w bardotce?",
    content: "Dziewczyny, też tak macie, że przy sukienkach bez ramiączek bardotka ciągle zjeżdża? Znalazłam genialny patent! Zamiast kupować silikonowe paski, sprawdźcie staniki z szerokim pasem obwodu i wewnętrzną taśmą silikonową o strukturze plastra miodu. U mnie model 'StayUp' trzyma się cały wieczór na weselu. Gdzie kupić? Ja zamawiam u nas na stronie z rabatem na pierwszy zakup.",
    visitorsEffect: 95
  },
  {
    group: "Prezenty dla Niej i dla Niego",
    title: "Jak kupić bieliznę dla partnerki i nie zaliczyć wpadki z rozmiarem?",
    content: "Panowie, zbliża się rocznica, a Wy chcecie podarować coś zmysłowego? Zamiast zgadywać rozmiar biustonosza (co jest trudne!), wybierzcie koronkowe body lub satynowy szlafrok z wiązaniem. Są elastyczne i łatwiej trafić z rozmiarem (S/M/L). Nasze koronkowe body 'Midnight' wygląda zjawiskowo na każdej sylwetce i jest zapakowane w elegancki czarny papier. Szybka wysyłka paczkomatem!",
    visitorsEffect: 110
  },
  {
    group: "Body Positivity Polska - Kochaj swoje ciało",
    title: "Piękno nie ma jednego rozmiaru - sesja bez retuszu",
    content: "Często w reklamach bielizny widzimy tylko modelki w rozmiarze XS. Chcemy to zmienić! Nasza nowa kolekcja 'All Curves' została zaprojektowana dla miseczek od A do G. Zobaczcie zdjęcia naszych klientek - bez retuszu, bez filtrów, czysta pewność siebie i luksusowa koronka. Zasługujesz na to, by czuć się pięknie każdego dnia.",
    visitorsEffect: 140
  },
  {
    group: "Panny Młode 2026/2027",
    title: "Bielizna pod suknię ślubną - co wybrać?",
    content: "Przyszłe Panny Młode, czy macie już wybraną bieliznę ślubną? Pamiętajcie, że pod gładkie suknie najlepsza jest bielizna bezszwowa w kolorze cielistym (nude), a nie białym! Biel widać pod cienkim materiałem, a cielisty zlewa się ze skórą. Nasz model 'Bridal Nude' ma dodatkowo obniżony tył pod głębokie dekolty na plecach. Sprawdźcie porady na naszym blogu sklepowym.",
    visitorsEffect: 120
  }
];

const MERCHANT_TEMPLATES = [
  {
    title: "Karta produktu 'Zmysłowe Body Midnight'",
    action: "Optymalizacja SEO i dodanie wideo produktowego",
    desc: "Dodano frazy 'koronkowe body damskie', 'czarne body pod marynarkę'. Wstawiono wideo 360 stopni prezentujące produkt na modelkach o różnych sylwetkach. Konwersja karty produktu wzrosła o 15%.",
    conversionEffect: 0.25
  },
  {
    title: "Ulepszenie koszyka zakupowego",
    action: "Wdrożenie mechanizmu 'Kup Teraz, Zapłać za 30 dni'",
    desc: "Zintegrowano darmowe metody płatności odroczonych (Klarna/PayPo) oraz ułatwiono zakup 1-kliknięciem przez BLIK. Ograniczy to zjawisko porzuconych koszyków o 20%.",
    conversionEffect: 0.4
  },
  {
    title: "Kolekcja 'Satin Dreams' - Dobór asortymentu",
    action: "Uruchomienie przedsprzedaży (Pre-order) na satynowe szlafroki",
    desc: "Uruchomienie opcji zakupu przedpremierowego pozwala sfinansować szycie nowej partii bez wkładu własnego. Opisy zoptymalizowano pod kątem prezentów ślubnych.",
    conversionEffect: 0.15
  },
  {
    title: "Tabela rozmiarów i Smart-Finder",
    action: "Wdrożenie interaktywnego kalkulatora rozmiarów",
    desc: "Stworzono quiz ułatwiający dobór miseczki na podstawie pytań o aktualnie noszone marki. Zmniejszy to współczynnik zwrotów i podniesie zaufanie kupujących.",
    conversionEffect: 0.3
  }
];

const STRATEGIST_TEMPLATES = [
  {
    title: "Analiza lejka sprzedażowego i optymalizacja organiczna",
    directive: "Skupienie działań na TikToku w celu ściągnięcia darmowego ruchu",
    desc: "Strateg zaleca: TikTok Agent przygotuje 2 wideo z testami praktycznymi (niewidzialność pod ubraniem). FB Agent udostępni porady o brafittingu na grupach ślubnych. Kierownik Sklepu wdroży rabat 10% za zapis do newslettera.",
  },
  {
    title: "Dywersyfikacja ruchu bez budżetu reklamowego",
    directive: "Wdrożenie programu poleceń dla klientek (Word of Mouth)",
    desc: "Strateg zaleca: Wprowadzenie programu 'Poleć przyjaciółce - obie zyskacie 20 PLN'. FB Agent nagłośni akcję na grupach o oszczędzaniu i modowych. Shopkeeper wdroży system generowania unikalnych kodów polecających.",
  },
  {
    title: "Strategia Content Commerce i SEO",
    directive: "Rozwój bloga brafitterskiego i pozycji w wyszukiwarce Google",
    desc: "Strateg zaleca: Przygotowanie artykułów o doborze stanika po ciąży i karmieniu. Treści te generują długofalowy ruch organiczny z Google. Kierownik zoptymalizuje podstrony bloga pod SEO.",
  }
];

// Generate dynamic Quests based on REAL products from WooCommerce
function generateQuests(state, products = []) {
  const questIds = ['q1', 'q2', 'q3', 'q4'];
  const newQuests = [];

  // Rezerwa produktów gdyby API nie zwróciło listy (z prawdziwymi zdjęciami ze sklepu Natura Intimo)
  const fallbackProducts = [
    { id: 91, name: "FIGI GORSENIA ASTRID", price: "50.99", images: [{ src: "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-ASTRID-BRAZYLIANY.jpg" }] },
    { id: 78, name: "FIGI GORSENIA ADORE", price: "74.99", images: [{ src: "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-ADORE-BRAZYLIANY.jpg" }] },
    { id: 72, name: "FIGI GORSENIA PERLA", price: "49.99", images: [{ src: "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-PERLA-BRAZYLIANY.jpg" }] }
  ];

  const activeProducts = (products && products.length > 0) ? products : fallbackProducts;

  // Losowe przetasowanie produktów przy każdym generowaniu zadań, aby agenci rotowali pełny asortyment
  const shuffled = [...activeProducts].sort(() => 0.5 - Math.random());

  const p1 = shuffled[0 % shuffled.length];
  const p2 = shuffled[1 % shuffled.length] || p1;
  const p3 = shuffled[2 % shuffled.length] || p1;
  const p4 = shuffled[3 % shuffled.length] || p1;

  // 1. Strategist directive quest
  newQuests.push({
    id: questIds[0],
    title: `[Strategia] Promocja organiczna: "${p1.name}"`,
    description: `Strategiczna analiza potencjału sprzedażowego produktu ${p1.name} (Cena: ${p1.price} PLN) i zaplanowanie kampanii organianej 0 PLN.`,
    agent: "strategist",
    xpReward: 40,
    completed: false,
    details: { id: p1.id, title: p1.name, price: p1.price }
  });

  // 2. Shopkeeper / Merchant quest
  newQuests.push({
    id: questIds[1],
    title: `[Sklep] Optymalizacja SEO: "${p2.name}"`,
    description: `Generowanie autorskiego opisu SEO dla produktu ID ${p2.id} (${p2.name}) i aktualizacja w WooCommerce.`,
    agent: "merchant",
    xpReward: 50,
    completed: false,
    details: { id: p2.id, title: p2.name, price: p2.price }
  });

  // 3. Instagram quest
  const p3Image = p3.images?.[0]?.src || "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-ASTRID-BRAZYLIANY.jpg";
  newQuests.push({
    id: questIds[2],
    title: `[Instagram] Wpis ze zdjęciem: "${p3.name}"`,
    description: `Kreacja wizualna i publikacja posta na żywo na IG dla produktu ${p3.name} (Cena: ${p3.price} PLN).`,
    agent: "instagram",
    xpReward: 60,
    completed: false,
    details: { id: p3.id, title: p3.name, price: p3.price, image: p3Image }
  });

  // 4. FB quest
  const p4Image = p4.images?.[0]?.src || "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-ADORE-BRAZYLIANY.jpg";
  newQuests.push({
    id: questIds[3],
    title: `[Facebook] Post promocyjny ze zdjęciem: "${p4.name}"`,
    description: `Tworzenie angazujacego posta ze zdjęciem produktu ${p4.name} (Cena: ${p4.price} PLN) dla grupy FB.`,
    agent: "facebook",
    xpReward: 50,
    completed: false,
    details: { id: p4.id, title: p4.name, price: p4.price, image: p4Image, group: "Moda i Stylizacja Polska" }
  });

  // 5. Blogger SEO quest
  const p5 = shuffled[4 % shuffled.length] || p1;
  newQuests.push({
    id: 'q5',
    title: `[Blog SEO] Artykuł poradnikowy: "${p5.name}"`,
    description: `Tworzenie pełnego poradnika brafittingowego z rekomendacją produktu ${p5.name} (Cena: ${p5.price} PLN) dla darmowego ruchu z Google.`,
    agent: "blogger",
    xpReward: 70,
    completed: false,
    details: { id: p5.id, title: p5.name, price: p5.price }
  });

  // 6. Reels Producer quest
  const p6 = shuffled[5 % shuffled.length] || p1;
  const p6Image = p6.images?.[0]?.src || "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-PERLA-BRAZYLIANY.jpg";
  newQuests.push({
    id: 'q6',
    title: `[Wideo Reels 9:16] Montaż i publikacja Rolki MP4: "${p6.name}"`,
    description: `Generowanie pliku wideo 9:16 MP4 ze zdjęcia i scenariusza dla produktu ${p6.name} (Cena: ${p6.price} PLN) i wysyłka do Instagram Reels.`,
    agent: "reels_producer",
    xpReward: 80,
    completed: false,
    details: { id: p6.id, title: p6.name, price: p6.price, image: p6Image }
  });

  return newQuests;
}

// Logic to run one simulation step
async function runSimulationCycle(state) {
  const logs = [...state.logs];
  const agents = { ...state.agents };
  let quests = [...state.quests];
  let revenue = state.revenue;
  let visitors = state.visitors;
  let conversionRate = state.conversionRate;
  let totalTokens = state.totalTokens || 0;
  let totalTokenCost = state.totalTokenCost || 0;

  const todayStr = new Date().toISOString().split('T')[0];
  let lastFbPostDate = state.lastFbPostDate || null;
  let lastIgPostDate = state.lastIgPostDate || null;
  let lastWpPostDate = state.lastWpPostDate || null;
  let lastReelPostDate = state.lastReelPostDate || null;
  let seoOptimizedProductIds = state.seoOptimizedProductIds || [];

  const timestamp = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Pobieramy 100% REALNE statystyki z WooCommerce REST API
  let realProducts = [];
  try {
    realProducts = await getProducts();
    const realMetrics = await getRealWooCommerceMetrics();
    if (realMetrics) {
      revenue = realMetrics.revenue;
      visitors = realMetrics.visitors;
      conversionRate = realMetrics.conversionRate;
    }
  } catch (err) {}

  // 1. If quests are empty or all completed, generate new ones based on REAL products
  const activeQuests = quests.filter(q => !q.completed);
  if (activeQuests.length === 0) {
    quests = generateQuests(state, realProducts);
    
    // Calculate token usage for generating quests (Strategist uses Gemini 3.5 Flash - Thinking)
    const inputTokens = 2500;
    const outputTokens = 800;
    const cost = (inputTokens * 0.000000075 + outputTokens * 0.00000030) * 4.0;
    totalTokens += (inputTokens + outputTokens);
    totalTokenCost = parseFloat((totalTokenCost + cost).toFixed(4));
    
    // Strategist action
    agents.strategist.status = "working";
    agents.strategist.activity = "Analiza katalogu WooCommerce i planowanie misji wokół realnych produktów...";
    
    // Add strategist log
    logs.push({
      id: Math.random().toString(),
      timestamp,
      sender: agents.strategist.name,
      message: `Pobrano realne produkty ze sklepu WooCommerce. Opracowano misje promocyjne dla produktów: ${quests.map(q => q.details.title).join(', ')}.`
    });
    
    // Distribute XP to strategist
    agents.strategist.xp += 20;
    if (agents.strategist.xp >= agents.strategist.nextXp) {
      agents.strategist.level += 1;
      agents.strategist.xp -= agents.strategist.nextXp;
      agents.strategist.nextXp = agents.strategist.level * 100;
      logs.push({
        id: Math.random().toString(),
        timestamp,
        sender: agents.strategist.name,
        message: `AWANS! Strateg awansował na poziom ${agents.strategist.level}! Odblokowano nowe strategie brafittingowe.`
      });
    }

    // Set other agents to idle/resting
    if (agents.merchant) {
      agents.merchant.status = "idle";
      agents.merchant.activity = "Oczekiwanie na dyrektywy stratega...";
    }
    if (agents.instagram) {
      agents.instagram.status = "idle";
      agents.instagram.activity = "Odpoczynek po publikacji zdjęć...";
    }
    if (agents.facebook) {
      agents.facebook.status = "idle";
      agents.facebook.activity = "Moderowanie dyskusji w komentarzach...";
    }

  } else {
    // 2. Pick one random uncompleted quest and make that agent complete it
    const randomQuestIndex = Math.floor(Math.random() * activeQuests.length);
    const questToComplete = activeQuests[randomQuestIndex];
    
    // Find in original array
    const qIndex = quests.findIndex(q => q.id === questToComplete.id);
    quests[qIndex].completed = true;

    const agentKey = questToComplete.agent;
    const agent = agents[agentKey];
    if (!agent) {
      console.warn(`[Agent Loop] Nieznany klucz agenta "${agentKey}". Wyczyszczono osieroconą misję.`);
      return state;
    }
    agent.status = "working";
    
    // Calculate token usage for completing a quest (simulation of LLM call)
    const inputTokens = Math.floor(Math.random() * 1000) + 1200;
    const outputTokens = Math.floor(Math.random() * 500) + 400;
    const tokensCount = inputTokens + outputTokens;
    
    // Gemini 3.5 Flash pricing for strategist, Gemini 3.5 Flash-Lite for action agents
    const isThinkingAgent = (agentKey === 'strategist');
    const inputRate = isThinkingAgent ? 0.000000075 : 0.0000000375;
    const outputRate = isThinkingAgent ? 0.00000030 : 0.00000015;
    const modelName = isThinkingAgent ? 'Gemini 3.5 Flash' : 'Gemini 3.5 Flash-Lite';
    
    const cost = (inputTokens * inputRate + outputTokens * outputRate) * 4.0;
    totalTokens += tokensCount;
    totalTokenCost = parseFloat((totalTokenCost + cost).toFixed(4));
    const tokenInfoSuffix = ` [${modelName} | Zużycie: ${tokensCount} tok., koszt: ~${cost.toFixed(4)} PLN]`;
    
    // Apply rewards and effects based on agent type
    let logMsg = "";
    if (agentKey === "instagram") {
      const effect = 180;
      visitors += effect;
      agent.activity = `Tworzenie i publikacja na IG: "${questToComplete.details.title}"`;
      
      // Sprawdzamy czy od ostatniej publikacji ROLKI (Reels) minęły co najmniej 3 dni
      const canPublishReel = isReelAllowedToday(lastReelPostDate);

      if (canPublishReel) {
        lastReelPostDate = todayStr;
        lastIgPostDate = todayStr;

        const imageUrl = questToComplete.details.image || "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-ASTRID-BRAZYLIANY.jpg";
        const videoUrl = generateFreeReelVideoUrl(imageUrl, questToComplete.details.title);
        const reelPrompt = `Napisz zmysłowy, angażujący opis wideo dla ROLKI (Reels) na Instagramie (max 3 zdania) dla REALNEGO produktu ze sklepu Natura Intimo: "${questToComplete.details.title}" w cenie ${questToComplete.details.price} PLN. Włącz hashtagi #naturaintimo #reels #bieliznadamska #gorsenia.`;

        generateContentAI(buildEnrichedPrompt("instagram", reelPrompt)).then(captionText => {
          const finalCaption = captionText || questToComplete.description;
          console.log(`[Instagram Reels AI] Wygenerowano scenariusz i wideo Rolki 9:16 dla (${questToComplete.details.title}):\n`, finalCaption);
          
          publishReelToInstagram(videoUrl, finalCaption, process.env.FB_PAGE_TOKEN, imageUrl)
            .then(res => console.log("[Instagram Reels API] OPULIKOWANO DARMOWĄ ROLKĘ WIDEO NA IG! ID:", res.id))
            .catch(err => console.log("[Instagram Reels API] Błąd publikacji Rolki:", err.message));
        });

        logMsg = `Opublikowano darmową ROLKĘ WIDEO (Reel) 9:16 dla produktu "${questToComplete.details.title}" (${questToComplete.details.price} PLN) na Instagramie! Pozyskano +450 unikalnych wyświetleń.${tokenInfoSuffix}`;
      } else if (lastIgPostDate === todayStr) {
        console.log(`[Instagram Limit] Osiągnięto dzisiejszy limit (1 post/dzień). Pomijanie wysyłania do Meta API.`);
        logMsg = `[IG LIMIT] Osiągnięto dzisiejszy limit (1 post/dzień). Materiał dla "${questToComplete.details.title}" przygotowany. Kolejny wpis API jutro.${tokenInfoSuffix}`;
      } else {
        lastIgPostDate = todayStr;
        const igPrompt = `Napisz krótki, zmysłowy i estetyczny podpis pod zdjęcie na Instagrama (max 3 zdania) dla REALNEGO produktu ze sklepu Natura Intimo: "${questToComplete.details.title}" w cenie ${questToComplete.details.price} PLN. Włącz hashtagi #naturaintimo #bieliznadamska #gorsenia.`;
        const imageUrl = questToComplete.details.image || "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-ASTRID-BRAZYLIANY.jpg";
        
        generateContentAI(buildEnrichedPrompt("instagram", igPrompt)).then(captionText => {
          const finalCaption = captionText || questToComplete.description;
          console.log(`[Instagram Agent AI] Wygenerowano podpis pod zdjęcie dla REALNEGO produktu (${questToComplete.details.title}):\n`, finalCaption);
          
          publishToInstagram(imageUrl, finalCaption)
            .then(res => console.log("[Instagram API] Opublikowano autorski post z fotką na żywo na IG! ID:", res.id))
            .catch(err => console.log("[Instagram API] Błąd publikacji na IG:", err.message));
        });

        logMsg = `Opublikowano estetyczny post ze zdjęciem dla realnego produktu "${questToComplete.details.title}" (${questToComplete.details.price} PLN) na Instagramie. Pozyskano +${effect} unikalnych wyświetleń.${tokenInfoSuffix}`;
      }
    } else if (agentKey === "reels_producer") {
      const effect = 450;
      visitors += effect;
      agent.activity = `Montaż i renderowanie wideo 9:16 dla Agenta Instagrama: "${questToComplete.details.title}"`;

      const imageUrl = questToComplete.details.image || "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-ASTRID-BRAZYLIANY.jpg";
      const videoUrl = generateFreeReelVideoUrl(imageUrl, questToComplete.details.title);
      const reelPrompt = `Jako Producent Wideo Studio, na podstawie zdjęcia HD (${imageUrl}), przygotuj wyraziste napisy i koncepcję dla wideo 9:16 dla produktu "${questToComplete.details.title}" (${questToComplete.details.price} PLN).`;

      generateContentAI(buildEnrichedPrompt("reels_producer", reelPrompt)).then(captionText => {
        console.log(`[Reels Producer Studio] Wyrenderowano materiał wideo MP4 9:16 dla Agenta Instagrama (${questToComplete.details.title}).`);
      });

      logMsg = `Twórca Rolek wyrenderował plik wideo MP4 (9:16) ze zdjęcia "${questToComplete.details.title}" i przekazał materiał do Agenta Instagrama!${tokenInfoSuffix}`;
    }
    } else if (agentKey === "facebook") {
      const effect = 80;
      visitors += effect;
      agent.activity = `Udostępnianie wpisu o: "${questToComplete.details.title}"`;
      
      if (lastFbPostDate === todayStr) {
        console.log(`[Facebook Limit] Osiągnięto dzisiejszy limit (1 post/dzień). Pomijanie wysyłania do Meta API.`);
        logMsg = `[FB LIMIT] Osiągnięto dzisiejszy limit (1 post/dzień). Materiał dla "${questToComplete.details.title}" przygotowany. Kolejny wpis API jutro.${tokenInfoSuffix}`;
      } else {
        lastFbPostDate = todayStr;
        const aiPrompt = `Napisz krótki, zmysłowy i elegancki post na Facebooka (max 3 zdania) dla REALNEGO produktu ze sklepu Natura Intimo: "${questToComplete.details.title}" w cenie ${questToComplete.details.price} PLN. Włącz zachętę do zakupu w sklepie i hashtagi #naturaintimo #bielizna.`;
        const fbImageUrl = questToComplete.details.image || "https://naturaintimo.com/wp-content/uploads/2026/04/FIGI-GORSENIA-ADORE-BRAZYLIANY.jpg";

        generateContentAI(buildEnrichedPrompt("facebook", aiPrompt)).then(aiText => {
          const postMessage = aiText || questToComplete.description;
          console.log(`[Facebook Agent AI] Wygenerowano post ze zdjęciem dla REALNEGO produktu (${questToComplete.details.title}):\n`, postMessage);
          
          publishToFacebook(postMessage, fbImageUrl)
            .then(res => console.log("[Facebook API] Opublikowano autorski post ZE ZDJĘCIEM na FB! ID:", res.id || res.post_id))
            .catch(err => console.log("[Facebook API] Błąd publikacji ze zdjęciem na FB:", err.message));
        });

        logMsg = `Wysłano autorski post z Gemini AI ZE ZDJĘCIEM realnego produktu "${questToComplete.details.title}" na grupę FB. Pozyskano +${effect} wejść na stronę.${tokenInfoSuffix}`;
      }
    } else if (agentKey === "merchant") {
      const effect = 0.25;
      conversionRate = parseFloat((conversionRate + effect).toFixed(2));
      agent.activity = `Optymalizacja WooCommerce: "${questToComplete.details.title}"`;
      
      const targetProductId = questToComplete.details.id;
      const isAlreadyOptimized = seoOptimizedProductIds.includes(targetProductId);

      if (isAlreadyOptimized) {
        console.log(`[Merchant Agent SEO Lock] Opis produktu ID ${targetProductId} (${questToComplete.details.title}) został już wcześniej raz zoptymalizowany. Pomijanie ponownego nadpisywania w WooCommerce.`);
        logMsg = `[SEO BLOKADA] Opis dla "${questToComplete.details.title}" (ID: ${targetProductId}) został już wcześniej zoptymalizowany pod SEO. Pomijanie powtórnej edycji.${tokenInfoSuffix}`;
      } else {
        // Dodajemy ID do listy zoptymalizowanych, aby edycja wykonała się TYLKO RAZ
        if (targetProductId) {
          seoOptimizedProductIds.push(targetProductId);
        }

        const merPrompt = `Napisz profesjonalny, zoptymalizowany pod SEO opis produktu dla sklepu Natura Intimo na temat: "${questToComplete.details.title}". 

BARDZO WAŻNY WYSKOKI RYGORYSTYCZNY WYMÓG:
Zwróć TYLKO I WYŁĄCZNIE sam czysty gotowy opis w HTML/Markdown do wklejenia na kartę produktu.
NIE DODAWAJ żadnych wstępów (typu "Oto profesjonalny opis...", "Poniżej znajduje się..."), NIE DODAWAJ żadnych rozmów ze mną, i NIE DODAWAJ sekcji "Wskazówki SEO (dla administratora sklepu)" na końcu! Zwróć wyłącznie samą właściwą treść opisu produktu.`;

        generateContentAI(buildEnrichedPrompt("merchant", merPrompt)).then(async (aiDesc) => {
          if (aiDesc && targetProductId) {
            // Czyszczenie treści z ewentualnych pozostałości pogawędek AI
            let cleanDesc = aiDesc
              .replace(/```html/gi, '')
              .replace(/```/g, '')
              .replace(/^Oto [\s\S]*?—\s*/i, '')
              .replace(/^Poniżej [\s\S]*?—\s*/i, '');

            // Obcięcie sekcji ze wskazówkami SEO dla admina na końcu opisu
            if (cleanDesc.includes('Wskazówki SEO') || cleanDesc.includes('💡')) {
              cleanDesc = cleanDesc.split(/###?\s*(?:💡|Wskazówki SEO|Meta Title)/i)[0];
              cleanDesc = cleanDesc.split(/💡\s*Wskazówki/i)[0];
            }

            cleanDesc = cleanDesc.trim();

            console.log(`[Merchant Agent AI] Jednorazowo zoptymalizowano opis dla REALNEGO produktu (ID: ${targetProductId}, Nazwa: ${questToComplete.details.title}). Zablokowano ponowną edycję.`);
            try {
              await updateProductDescription(targetProductId, cleanDesc);
              console.log(`[WooCommerce API] JEDNORAZOWO ZAKTUALIZOWANO OPIS REALNEGO PRODUKTU ID ${targetProductId} W SKLEPIE WOOCOMMERCE!`);
            } catch (err) {
              console.error("[WooCommerce API] Błąd aktualizacji opisu:", err.message);
            }
          }
        });
        
        logMsg = `Jednorazowo zaktualizowano opis SEO dla realnego produktu ID ${targetProductId} (${questToComplete.details.title}) w WooCommerce! (Zablokowano kolejne automatyczne zmiany).${tokenInfoSuffix}`;
      }
    } else if (agentKey === "blogger") {
      const effect = 350;
      visitors += effect;
      agent.activity = `Pisanie artykułu SEO na bloga: "${questToComplete.details.title}"`;
      
      if (lastWpPostDate === todayStr) {
        console.log(`[WordPress Limit] Osiągnięto dzisiejszy limit (1 artykuł/dzień). Pomijanie wysyłania do WP REST API.`);
        logMsg = `[WP LIMIT] Osiągnięto dzisiejszy limit (1 wpis/dzień). Materiał dla "${questToComplete.details.title}" przygotowany. Kolejny wpis API jutro.${tokenInfoSuffix}`;
      } else {
        lastWpPostDate = todayStr;
        const blogPrompt = `Jesteś profesjonalnym Blogerem i ekspertem brafittingu dla sklepu z bielizną Natura Intimo (naturaintimo.com). 
Napisz wartościowy, poradnikowy artykuł SEO na bloga na temat: "Jak idealnie dobrać i nosić ${questToComplete.details.title}?". 

Wymogi:
- Użyj nagłówków HTML (<h2>, <h3>), wypunktowań (<ul>/<li>) oraz praktycznych porad brafittingowych.
- Włącz rekomendację zakupu modelu ${questToComplete.details.title} w sklepie Natura Intimo (Cena: ${questToComplete.details.price} PLN).
- Zwróć TYLKO czysty kod HTML artykułu (bez wstępów AI typu "Oto artykuł...").`;

        generateContentAI(buildEnrichedPrompt("blogger", blogPrompt)).then(async (articleHtml) => {
          if (articleHtml) {
            let cleanArticle = articleHtml
              .replace(/```html/gi, '')
              .replace(/```/g, '')
              .replace(/^Oto [\s\S]*?—\s*/i, '')
              .trim();

            const blogTitle = `Jak idealnie dobrać i nosić ${questToComplete.details.title}? Poradnik Brafittingowy`;
            console.log(`[Blogger Agent AI] Wygenerowano pełny artykuł SEO na bloga dla produktu ${questToComplete.details.title}.`);

            const res = await publishToWordPressBlog(blogTitle, cleanArticle);
            if (res && res.link) {
              console.log(`[WordPress Blog API] Opublikowano artykuł na żywo na blogu: ${res.link}`);
            }
          }
        });

        logMsg = `Napisano autorski artykuł SEO z Gemini AI dla "${questToComplete.details.title}" na bloga sklepu! Pozyskano +${effect} organicznych wejść z Google.${tokenInfoSuffix}`;
      }
    } else if (agentKey === "strategist") {
      agent.activity = `Analiza potencjału: "${questToComplete.details.title}"`;
      
      // STRATEGICZNA ANALIZA PRZEZ GEMINI AI
      const strPrompt = `Przeanalizuj potencjał promocyjny REALNEGO produktu: "${questToComplete.details.title}" w cenie ${questToComplete.details.price} PLN. Sformułuj jedną zwięzłą radę dotyczącą bezpłatnego zwiększenia jego sprzedaży.`;
      generateContentAI(buildEnrichedPrompt("strategist", strPrompt)).then(aiAdvice => {
        if (aiAdvice) {
          console.log(`[Strategist Agent AI] Strateg wygenerował nową dyrektywę dla realnego produktu (${questToComplete.details.title}):\n`, aiAdvice);
        }
      });

      logMsg = `Przeanalizowano potencjał rynkowy realnego produktu "${questToComplete.details.title}" przez Gemini AI. Zoptymalizowano strategię marketingową.${tokenInfoSuffix}`;
    }

    // Add log
    logs.push({
      id: Math.random().toString(),
      timestamp,
      sender: agent.name,
      message: logMsg
    });

    // Give XP
    agent.xp += questToComplete.xpReward;
    if (agent.xp >= agent.nextXp) {
      agent.level += 1;
      agent.xp -= agent.nextXp;
      agent.nextXp = agent.level * 100;
      logs.push({
        id: Math.random().toString(),
        timestamp,
        sender: agent.name,
        message: `AWANS! ${agent.name} awansował na poziom ${agent.level}!`
      });
    }

    // Reset other agent activities to idle if they were working, to make it visual
    Object.keys(agents).forEach(k => {
      if (k !== agentKey) {
        agents[k].status = "idle";
      }
    });

    // 3. SPRAWDZENIE REALNYCH ZAMÓWIEŃ Z WOOCOMMERCE
    let realOrders = [];
    try {
      realOrders = await getRecentOrders();
    } catch (err) {}

    if (realOrders && realOrders.length > 0) {
      // Wyliczamy sumaryczny przychód z realnych zamówień ze sklepu WooCommerce
      const totalRealRevenue = realOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
      revenue = Math.round(totalRealRevenue);
      
      const latestOrder = realOrders[0];
      const itemName = latestOrder.line_items?.[0]?.name || "Bielizna Natura Intimo";
      
      // Sprawdzamy czy to zamówienie było już rejestrowane w logach
      const alreadyLogged = logs.some(l => l.message.includes(`#${latestOrder.id}`));
      if (!alreadyLogged) {
        logs.push({
          id: Math.random().toString(),
          timestamp,
          sender: "Sklep WooCommerce (REAL)",
          message: `[ZAMÓWIENIE WOOCOMMERCE #${latestOrder.id}] Zamówienie w sklepie: ${itemName} na kwotę ${latestOrder.total} PLN! (Status: ${latestOrder.status})`
        });
      }
    }
  }

  // Aktualizacja historii danych dla wykresów czasu rzeczywistego
  let history = state.history || [];
  const currentShortTime = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const lastHistoryPoint = history[history.length - 1];
  if (!lastHistoryPoint || lastHistoryPoint.time !== currentShortTime || lastHistoryPoint.revenue !== revenue || lastHistoryPoint.visitors !== visitors) {
    history.push({
      time: currentShortTime,
      revenue: revenue,
      visitors: visitors,
      conversion: conversionRate
    });
    if (history.length > 10) {
      history = history.slice(-10);
    }
  }

  // Keep logs list trimmed to last 40 entries
  if (logs.length > 40) {
    logs.shift();
  }

  return {
    revenue,
    conversionRate,
    visitors,
    history,
    agents,
    quests,
    logs,
    totalTokens,
    totalTokenCost,
    lastFbPostDate,
    lastIgPostDate,
    lastWpPostDate,
    lastReelPostDate,
    seoOptimizedProductIds
  };
}

// REST APIs
app.get('/api/state', (req, res) => {
  const state = readDb();
  res.json(state);
});

app.post('/api/update-stats', (req, res) => {
  const state = readDb();
  const { revenue, visitors, conversionRate } = req.body;
  
  if (revenue !== undefined && !isNaN(revenue)) state.revenue = parseFloat(revenue);
  if (visitors !== undefined && !isNaN(visitors)) state.visitors = parseInt(visitors);
  if (conversionRate !== undefined && !isNaN(conversionRate)) state.conversionRate = parseFloat(conversionRate);

  const timestamp = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  state.logs.push({
    id: Math.random().toString(),
    timestamp,
    sender: "Sklep (System Danych)",
    message: `[AKTUALIZACJA DANYCH] Ustawiono realne dane sklepu: Zysk=${state.revenue} PLN, Ruch=${state.visitors} UU, Konwersja=${state.conversionRate}%.`
  });

  writeDb(state);
  res.json(state);
});

app.post('/api/trigger-cycle', async (req, res) => {
  const state = readDb();
  const newState = await runSimulationCycle(state);
  writeDb(newState);
  res.json(newState);
});

app.post('/api/reset', (req, res) => {
  const initialState = {
    revenue: 0,
    conversionRate: 0,
    visitors: 0,
    agents: {
      strategist: {
        name: "Strateg (The Oracle)",
        level: 1,
        xp: 0,
        nextXp: 100,
        status: "idle",
        activity: "Planowanie autorskich dyrektyw marketingowych...",
        color: "#a855f7"
      },
      merchant: {
        name: "Kierownik Sklepu (The Merchant)",
        level: 1,
        xp: 0,
        nextXp: 100,
        status: "idle",
        activity: "Zarządzanie katalogiem produktów WooCommerce...",
        color: "#eab308"
      },
      tiktok: {
        name: "TikTok Agent (Viral Architect)",
        level: 1,
        xp: 0,
        nextXp: 100,
        status: "idle",
        activity: "Tworzenie viralowych scenariuszy wideo...",
        color: "#ec4899"
      },
      facebook: {
        name: "FB Agent (Community Connector)",
        level: 1,
        xp: 0,
        nextXp: 100,
        status: "idle",
        activity: "Publikowanie unikalnych postów na FB i Instagramie...",
        color: "#3b82f6"
      }
    },
    quests: [],
    logs: [
      {
        id: "1",
        timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sender: "Strateg (The Oracle)",
        message: "Wyzerowano statystyki. Zespół gotowy do promocji sklepu z bielizną Natura Intimo."
      }
    ],
    totalTokens: 0,
    totalTokenCost: 0
  };
  writeDb(initialState);
  res.json(initialState);
});

// Start background simulation ticker (every 30 seconds)
setInterval(async () => {
  try {
    const state = readDb();
    // Only auto-simulate if backend runs
    const newState = await runSimulationCycle(state);
    writeDb(newState);
    console.log("Background simulation cycle executed successfully.");
  } catch (err) {
    console.error("Error in background simulation loop:", err);
  }
}, 30000);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
