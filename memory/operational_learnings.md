# Natura Intimo – Operational Learnings & Agent Experience Base (`memory/operational_learnings.md`)

Ten dokument stanowi dynamiczną bazę wiedzy i doświadczeń operacyjnych zespołu autonomicznych agentów LLM pracujących nad sklepem **Natura Intimo** (`naturaintimo.com`). Każdy agent po napotkaniu nowego przypadku brzegowego, wdrożeniu poprawki lub weryfikacji danych ma obowiązek udokumentować tutaj swoje wnioski.

---

## 1. WordPress & WooCommerce Engineering (`tech-ux-security-sms`)
* **Problem formatowania wpautop:** Bezpośrednie wstrzykiwanie tagów `<script>` i JSON-LD do treści podstron WordPress (`post_content`) powoduje psucie składni przez funkcję `wpautop` (automatyczne dodawanie `<p>` i `<br />` wewnątrz skryptów), co skutkuje wyciekiem surowego kodu na frontendzie dla klientów.
  * **Rozwiązanie P0:** Kod JavaScript i schema JSON-LD muszą być ładowane wyłącznie przez dedykowany Snippet PHP (`Code Snippets`) podpięty pod hak `wp_footer` lub `wp_head` z warunkiem `is_page(...)` lub `is_product()`.
* **Kalkulator rozmiarów pod selektorem wariantu:** Selektory wariantów WooCommerce w motywie dynamicznie resetują stan formularza `form.variations_form`. Skrypt przeliczający rozmiary EU↔US/UK musi nasłuchiwać zdarzenia `found_variation` oraz `check_variations` na poziomie jQuery `$(document).on('woocommerce_variation_has_changed')`.
* **Czysty HTML w opisach MADA:** Opisy importowane z hurtowni MADA często zawierają zagnieżdżone tagi `<table>` oraz `<div>` o stałej szerokości `width: 600px`, psując responsywność na urządzeniach mobilnych w USA/Kanadzie. Należy stosować sanitizer strippingujący inline styles.

## 2. Prawne i Celne USA / Kanada (`us-ca-compliance-auditor-sms` & `accounting-export-customs-sms`)
* **California SB 478 (Honest Pricing Law):** Wszelkie obowiązkowe opłaty manipulacyjne lub cła muszą być wliczone w cenę bazową lub w z góry określony ryczałt wysyłkowy ($24.99 USD DDP). Zakaz naliczania nieujawnionych opłat celnych przy doręczeniu w USA.
* **Kanadyjski zakaz Drip Pricing (Competition Act):** Klient z Kanady nie może widzieć ceny w USD bez wyraźnego oznaczenia waluty, a stawka wysyłki ($34.99 CAD) musi być prezentowana w całości przed checkoutem.
* **CETA Preferential Origin dla Kanady:** Aby biustonosze i majtki produkowane w Polsce korzystały z preferencyjnej stawki celnej 0% CETA w Kanadzie, Commercial Invoice musi zawierać standardową deklarację pochodzenia eksportera zarejestrowanego w REX (lub do progu 6 000 EUR z deklaracją na fakturze).
* **Rozbicie kompletów na fakturze DHL (HTS):** Komplet bielizny (np. Biustonosz + Majtki) nie może być fakturowany pod jednym kodem HTS. Biustonosz wymaga kodu HTS `6212.10.9020` (stawka celna USA 16.9%), a figi/majtki wymagają kodu `6108.22.9020` (stawka celna USA 7.6% - 15.6% zależnie od składu). Rabat za komplet (-$10 USD / -40 PLN) musi być rozdzielony proporcjonalnie do wartości poszczególnych komponentów.

## 3. Katalog Produktów & Brafitting (`store-manager-sms` & `brafitting-customer-care-sms`)
* **Zastrzeżone znaki towarowe (Gaia Nike -> BS 1135):** Linia biustonoszy Gaia o nazwie handlowej "Nike" narusza zastrzeżony znak towarowy firmy Nike Inc. w klasie 25 w USA. Wersja angielska musi bezwzględnie używać oznaczenia kodowego `BS 1135` / `GFB 1135`.
* **Dopasowanie Gorsenia (Deep Cups):** Modele Gorsenia (np. K496 Paradise, K441 Luisse, K631 Morisson) charakteryzują się bardzo głębokimi miseczkami i wąskimi fiszbinami. Klientkom z USA o szerokim rozstawie piersi rekomenduje się model Gaia lub Ava, natomiast klientkom szukającym mocnego zebrania i projekcji do przodu – Gorsenia w rozmiarze o 1 miseczkę mniejszym przy wahaniu między rozmiarami.
* **Polityka Free First Size Exchange (RMA 30 dni):** Aby zminimalizować barierę pierwszego zakupu biustonosza przez ocean, pierwsza wymiana rozmiaru jest bezpłatna dla klienta w ciągu 30 dni od doręczenia.

## 4. Marketing Organiczny i AI SEO (`growth-marketing-ai-seo-sms`)
* **Zero Halucynacji w Treściach Postów:** Wszelkie posty publikowane na FB/IG muszą precyzyjnie podawać parametry logistyczne z `market_config.json` ($24.99 USD ryczałt DDP, darmowa dostawa od $150.00 USD / $200.00 CAD). Błędne ceny natychmiast niszczą zaufanie klienta i podlegają karom FTC.
* **Architektura GEO (`/llms.txt`):** Silniki wyszukiwania AI (ChatGPT Search, Perplexity, Claude, Google AI Overviews) indeksują plik `/llms.txt` jako ustrukturyzowaną bazę odpowiedzi. Kluczowe jest podawanie bezpośrednich, precyzyjnych odpowiedzi typu "Answer-First" na początku każdej sekcji.
