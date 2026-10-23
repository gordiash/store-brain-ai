# Natura Intimo – Workspace Rules & Agent Directives (`AGENTS.md`)

Ten plik definiuje bezwzględne reguły obowiązujące wszystkich agentów (oraz subagentów) pracujących nad sklepem **Natura Intimo** (`naturaintimo.com`) na rynkach **USA, Kanady oraz Polski**, z wykorzystaniem centralnego repozytorium **Store Brain AI** (`https://github.com/gordiash/store-brain-ai.git`).

---

## 1. Bezpieczeństwo Poświadczeń (Zero Hardcoded Secrets – P0)
* **CAŁKOWITY ZAKAZ** wpisywania w kodzie (`.js`, `.mjs`, `.php`, `.json`, `.py`, `.md`) haseł aplikacji WordPress (`WP_APP_PASSWORD`), kluczy WooCommerce (`WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`), tokenów Meta Graph API, tokenów KSeF, kluczy Gemini API czy GitHub Personal Access Tokenów — dotyczy to również wartości domyślnych / fallbacków (`process.env.KEY || 'tajne_haslo'`).
* Wszystkie poświadczenia muszą być pobierane wyłącznie ze zmiennych środowiskowych `process.env` / `os.environ` (plik `.env` bezwzględnie wykluczony w `.gitignore`). Brak wymaganej zmiennej środowiskowej musi natychmiast przerywać działanie skryptu błędem (`throw new Error(...)`).
* W zapytaniach do WooCommerce REST API oraz WordPress REST API używaj nagłówka `Authorization: Basic ...` zamiast przekazywania `consumer_key` i `consumer_secret` w parametrach URL (query string), aby uniknąć logowania kluczy w logach serwera.

## 2. Backup & Tracker First (Bezpieczeństwo Bazy WooCommerce – P0)
* Przed każdą masową lub strukturalną modyfikacją produktów, stron, widgetów lub snippetów PHP na żywym sklepie `naturaintimo.com` agent **musi** wykonać kopię zapasową do katalogu `backend/backups/` (np. przy użyciu `backend/create_backup.js`).
* Każda operacja zmieniająca dane w WooCommerce/WordPress musi być rejestrowana w pliku śledzenia (np. `memory/operational_tracker.json`, `backend/usa_canada_tracker.json`) wraz z datą, ID zasobu i statusem odpowiedzi HTTP.

## 3. Jedno Źródło Prawdy (`brain/single_source_of_truth/market_config.json` – P0)
* Wszystkie parametry handlowe i logistyczne (progi darmowej dostawy, stawki wysyłki, opłaty DDP/DAP, nazwy przewoźników, czas dostawy, okno zwrotów 30 dni dla US/CA, kontaktowy adres e-mail i telefon) muszą być odczytywane z pliku `brain/single_source_of_truth/market_config.json` (oraz jego kopii roboczej `backend/market_config.json`).
* **ZAKAZ** ręcznego wpisywania sprzecznych kwot lub przewoźników (np. *FedEx*, *PLN 200*) w treściach regulaminów, FAQ, stron wysyłki, stopki, a także w postach social media.

## 4. Rygor Danych Produktowych i Zgodność z FTC / Competition Bureau (P0)
* **Zero Halucynacji (FTC Substantiation & Textile Act):** Agentowi **nie wolno** zmyślać ani zgadywać składu surowcowego włókien (`_material_composition`), kraju pochodzenia (`_country_of_origin`), kodów celnych HTS ani właściwości medycznych/hipoalergicznych.
* Dane te mogą pochodzić wyłącznie z pliku źródłowego hurtowni MADA (`products.xml`) lub oficjalnej specyfikacji producenta (Gorsenia, Gaia, Ava, Mefemi, Alles).
* Jeśli produkt nie posiada w źródle jednoznacznego składu surowcowego lub kraju pochodzenia, agent musi ustawić flagę `_requires_customs_review = 'yes'` i dopisać produkt do listy `flaggedIds` do ręcznej weryfikacji właścicielki.
* **Czarna lista twierdzeń (Forbidden Claims):** Zakaz używania nieudokumentowanych określeń: *handcrafted*, *handmade*, *custom tailored*, *bestseller* (dla produktów bez historii sprzedaży), *medical grade*, *prevents irritation*, *for real women* (wykluczające kulturowo w US/CA), oraz zakaz umieszczania w tytułach produktów nazw kolidujących z zastrzeżonymi znakami towarowymi w USA (np. nazwa linii *Nike* marki Gaia musi być zastąpiona kodem modelu `BS 1135` / `GFB 1135`).
* **Czarna lista nagości, erotyki i pornografii (Adult/Nudity Policy – P0):** Całkowity zakaz używania w postach social media, opisach produktów i reklamach słów triggerujących filtry Meta/TikTok/Google Adult Content: `nude`, `naked`, `porn`, `sex`, `sexy`, `erotic`, `boobs`, `nipple`, `sheer`, `see-through`, `thong`, `hot`, `seductive`. W zamian należy stosować bezpieczną terminologię brafittingową i modową: `neutral beige / champagne`, `sensual / refined`, `fine breathable mesh`, `Brazilian cut`, `full bust`, `cup support`.

## 5. Separacja Językowa i Walutowa (US / CA / PL – P1)
* Strony, komunikaty koszyka, snippety PHP i e-maile kierowane do klientów z USA i Kanady (`/en/`, `en-US`, `en-CA`) muszą być w 100% po angielsku (a dla prowincji Quebec docelowo również po francusku `fr-CA` zgodnie z *Bill 96*).
* Ceny muszą jednoznacznie wskazywać walutę (`USD` / `US$` dla USA, `CAD` / `C$` dla Kanady, `PLN` dla Polski). Zakaz wyświetlania nieopisanego symbolu `$` klientom z Kanady bez wskazania waluty.
* Obowiązkowe opłaty nie mogą być ukrywane do ostatniego kroku koszyka (*California SB 478 – Honest Pricing Law* oraz kanadyjski zakaz *Drip Pricing*).

## 6. Podział Ról Zespołu Agentów i Struktura Podległości
Przy wykonywaniu zadań agenci korzystają ze swoich dedykowanych skillów w `.agents/skills/` oraz zsynchronizowanych podręczników w `brain/agent_guidebooks/`:
1. **Kierownik Sklepu (`store-manager-sms` / `merchant.md`):** Katalog WooCommerce, skład i pochodzenie z MADA XML, konwersja rozmiarów EU↔US, realizacja zamówień i alerty stanów.
   * *Nadzorowany skill:* `inventory-feed-sync-optimizer-sms` (automatyczna synchronizacja feedu XML, normalizacja rozmiarów i zapobieganie brakom magazynowym).
2. **CEO Przedsięwzięcia (`ecommerce-ceo-sms` / `ceo.md`):** Strategia 0 PLN Organic First, marża po cłach DDP, nadzór nad `market_config.json`, koordynacja zespołu agentów.
   * *Nadzorowany skill:* `cro-checkout-optimizer-sms` (wspólnie z Inżynierem).
3. **Marketingowiec & CMO (`growth-marketing-ai-seo-sms` / `cmo.md`):** TikTok, IG, FB, Pinterest, klasyczne SEO, Google Merchant oraz AI SEO / GEO (`/llms.txt`, ustrukturyzowane Q&A).
   * *Nadzorowane skille:* `geo-ai-search-optimizer-sms` (Generative Engine Optimization pod ChatGPT/Perplexity/AI Overviews) oraz `retention-abandoned-cart-sms` (sekwencje ratunkowe porzuconych koszyków).
4. **Dyrektor Marketingu (`marketing-director-sms`):** Planowanie i harmonogramowanie kampanii wielokanałowych, publikacja treści i weryfikacja poprawności postów.
5. **Księgowy i Eksport (`accounting-export-customs-sms` / `accountant.md`):** Faktury B2C/B2B, integracja z KSeF FA(3) i kursem NBP, dokumenty eksportowe 0% VAT (IE-599), Commercial Invoice dla DHL Express, kody HTS per komponent, deklaracje CETA.
   * *Nadzorowany skill:* `customs-hts-ceta-auditor-sms` (klasyfikacja celna HTS 6212.10 vs 6108.22, reguły CETA 0% i walidacja kursów NBP).
6. **Brafitterka i Obsługa Klienta (`brafitting-customer-care-sms` / `customer_care.md`):** Dobór rozmiaru EU↔US/UK, *sister sizes*, SLA <24h, obsługa zwrotów i darmowej pierwszej wymiany rozmiaru (RMA 30 dni).
   * *Nadzorowane skille:* `brafitting-conversational-advisor-sms` (konwersacyjne drzewo decyzyjne i doradztwo kształtu biustu), `retention-abandoned-cart-sms` (rozwiewanie obaw o rozmiar) oraz `review-reputation-manager-sms` (zbieranie recenzji dopasowania).
7. **Inżynier Sklepu, UX i Bezpieczeństwa (`tech-ux-security-sms` / `tech_lead.md`):** Snippety PHP, routing `/en/`, optymalizacja frontendu, dostępność ADA / WCAG 2.2 AA, wydajność i bezpieczeństwo API.
   * *Nadzorowane skille:* `cwv-performance-booster-sms` (Core Web Vitals LCP < 2.0s, caching Litespeed i ochrona przed wpautop) oraz `cro-checkout-optimizer-sms` (koszyk, sticky CTA, płatności express).
8. **Strażnik Compliance US/CA (`us-ca-compliance-auditor-sms` / `compliance.md`):** Kontrola *pre-flight* zgodności prawnej (FTC, SB 478, Bill 96) i bezpieczeństwa znaków towarowych.
   * *Nadzorowane skille:* `ftc-pricing-privacy-auditor-sms` (skanowanie California SB 478, kanadyjskiego Drip Pricing i Textile Act) oraz `review-reputation-manager-sms` (rygor FTC 16 CFR Part 465).

---

## 7. Repozytorium GitHub `store-brain-ai` jako Mózg i Baza Wiedzy
* Repozytorium **`https://github.com/gordiash/store-brain-ai.git`** stanowi nadrzędne, wersjonowane środowisko wiedzy operacyjnej i samouczenia się całego ekosystemu agentów Natura Intimo.
* **Struktura Repozytorium:**
  * `AGENTS.md` – Główne zasady i protokoły operacyjne.
  * `.agents/skills/` – Zbiór 30 wyspecjalizowanych umiejętności agentowych.
  * `brain/single_source_of_truth/` – Parametry biznesowe, identyfikacja marki, matryca rozmiarów.
  * `brain/ai_seo/` – Baza wiedzy Generative Engine Optimization (`llms.txt`, `llms-full.txt`).
  * `brain/agent_guidebooks/` – Szczegółowe podręczniki ról agentów (`ceo.md`, `merchant.md`, itp.).
  * `brain/autonomous_engine/` – 4 silniki automatyzacji i autonomii (Paperclip, Self-Improving, LangGraph, AutoGen).
  * `memory/` – Pamięć ciągła, dziennik wniosków operacyjnych (`operational_learnings.md`) i bazy przypadków brzegowych (`brafitting_edge_cases.json`, `customs_and_tax_rulings.json`, `audience_insights.json`).
  * `backend/` – Skrypty wykonawcze, konektory API i zoptymalizowane snippety PHP.

---

## 8. Protokół Ciągłego Samouczenia Się Agentów (Continuous Self-Learning Protocol)
Każdy agent wykonujący zadanie ma obowiązek działać zgodnie z pętlą samouczenia się:
1. **Przed zadaniem (Read Knowledge First):** Agent odczytuje odpowiednie pliki z `brain/` oraz `memory/` (np. przed doradzeniem rozmiaru brafitterka czyta `memory/brafitting_edge_cases.json` i `brain/single_source_of_truth/size_conversion_matrix.json`).
2. **Podczas zadania:** Agent stosuje reguły Zero Secrets (P0) i Jednego Źródła Prawdy (P0).
3. **Po wykonaniu zadania (Reflect & Learn):**
   * Jeśli agent napotkał nowy przypadek brzegowy (np. specyficzny krój miseczki nowej marki, zmiana w algorytmie Instagrama, nowy wymóg celny USA/Kanady, naprawiony błąd techniczny WordPressa), **MOGŁBY I POWINIEN** zaktualizować odpowiedni plik w katalogu `memory/` lub `brain/`.
   * Wszelkie kluczowe lekcje techniczne, prawne i marketingowe należy dopisać do `memory/operational_learnings.md`.
4. **Synchronizacja z Repozytorium (Git Commit & Push):**
   * Po zaktualizowaniu plików wiedzy, agent tworzy commit w repozytorium `store-brain-ai` zgodnie z konwencją:
     `learn(<rola>): <krótki opis nowo nabytej wiedzy lub przypadku brzegowego>` (np. `learn(brafitting): add Gorsenia K496 cup depth nuance`).
   * Zapewnia to, że wszyscy agenci oraz kolejne sesje zawsze korzystają z najświeższej, stale rozwijającej się bazy wiedzy sklepu.

---

## 9. Cztery Silniki Autonomii i Samodzielności Agentów (`brain/autonomous_engine/`)
Aby zagwarantować pełną samodzielność, niezawodność i samodoskonalenie się zespołu sklepu bez ciągłego nadzoru człowieka, wdrożono architekturę 4 zintegrowanych silników:

1. **Paperclip Heartbeat Daemon (`paperclip_heartbeat_daemon.py`):**
   * *Wzorzec:* `paperclipai/paperclip` (Zero-Human Company Architecture).
   * *Działanie:* Cykliczne "uderzenia serca" (heartbeats) zamiast kosztownych nieskończonych pętli tokenowych. Odpowiada za 4 codzienne pulsy: poranny standup NBP/MADA, cogodzinny monitoring porzuconych koszyków, weryfikację zamówień i wieczorny odczyt analityki Meta Graph API.
2. **Awesome Self-Improving Agents (`self_improving_reflection_loop.py`):**
   * *Wzorzec:* `selfimproving-agent/Awesome-Self-Improving-Agents` & `AFunLS/self-evolving-agent-patterns`.
   * *Działanie:* Wbudowany "system odpornościowy" (Immune System) testujący działania agentów pod kątem znanych błędów (zakazane słowa FTC, brakujące koszty DDP, naruszenia znaków towarowych) oraz automatyczna pętla ekstrakcji i zapisu nowo nabytej wiedzy.
3. **LangGraph State Router (`langgraph_workflow_router.py`):**
   * *Wzorzec:* `langchain-ai/langgraph` (Stateful Cyclic Graphs).
   * *Działanie:* Modelowanie procesów e-commerce (np. `Order -> Customs -> MADA -> Commercial Invoice -> Onboarding` oraz `Draft -> Compliance -> Stock -> Publish`) jako stanowych grafów cyklicznych z warunkowym rozgałęzieniem i obsługą poprawek w razie odrzucenia.
4. **AutoGen Consensus Swarm (`autogen_consensus_swarm.py`):**
   * *Wzorzec:* `microsoft/autogen` (Multi-Agent Conversational Deliberation).
   * *Działanie:* Wielogłosowa debata i konsensus między agentami (CEO, CMO, Merchant, Compliance) przed każdą publikacją kampanii lub masową modyfikacją produktów.
