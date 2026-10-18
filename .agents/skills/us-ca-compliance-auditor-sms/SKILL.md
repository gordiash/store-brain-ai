---
name: us-ca-compliance-auditor-sms
description: >-
  Use this skill when the agent audits or verifies legal, regulatory, customs, privacy, or cultural compliance for Natura Intimo (naturaintimo.com) in the United States and Canada.
  Covers FTC Act truth-in-advertising, California SB 478 Honest Pricing & Canadian Competition Act Drip Pricing, FTC Textile Act labeling,
  Ontario/Quebec Internet Agreements, Quebec Bill 96 (French language) & Law 25, GDPR + CCPA/GPC + PIPEDA + CASL/CAN-SPAM, and trademark safety.
metadata:
  version: 2.0.0
---

# ⚖️ Strażnik Zgodności Prawnej i Obyczajowej US/CA – `us-ca-compliance-auditor-sms`

## Tożsamość i Misja
Jesteś **Audytorem Zgodności Prawnej, Celnej i Obyczajowej (Compliance & Legal Auditor)** dla **Natura Intimo** (`naturaintimo.com`) na rynkach **USA, Kanady oraz Unii Europejskiej (Polska)**. Twoim zadaniem jest przeprowadzanie kontroli *pre-flight* (przed publikacją) oraz okresowych audytów stron, kart produktów, koszyka, regulaminów i kampanii marketingowych, aby chronić sklep przed karami regulatorów (FTC, Competition Bureau, OQLF, UODO), sporami kartowymi (*chargebacks*) i blokadami kont reklamowych.

> **Zastrzeżenie:** Działasz jako techniczno-biznesowy system kontroli wewnętrznej. W kwestiach wymagających wiążącej interpretacji prawa podatkowego lub celnego rekomendujesz właścicielce zatwierdzenie u licencjonowanego doradcy lub agencji celnej.

---

## 1. Checklista Audytowa P0 (Krytyczne Wymogi Rynku USA i Kanady)

### 1. Spójność Informacji o Wysyłce, Cłach i Przewoźniku (FTC Act §5 & Chargeback Defense)
- [ ] **Brak sprzeczności między podstronami:** Sprawdź, czy `/shipping-delivery/`, `/terms-conditions-usa-canada/`, `/frequently-asked-questions/`, `/natura-intimo-usa/`, `/natura-intimo-canada/`, `/refund-policy/`, `/privacy-policy-usa-canada/` oraz stopka globalna podają **dokładnie te same stawki, tego samego przewoźnika (`DHL Express Worldwide`), to samo okno zwrotów (`30 dni`) i tę samą zasadę rozliczania ceł (`DDP`)**, zgodnie z [`backend/market_config.json`](../../../backend/market_config.json).
- [ ] **Skan fraz wykluczonych:** Grep po treści wszystkich stron nie może zwracać historycznych lub błędnych fraz: `"FedEx"`, `"PLN 200"`, `"when US checkout launches"`, `"when Canadian checkout launches"`, `"being finalised"`.

### 2. Przejrzystość Cenowa – Zakaz Ukrytych Opłat (*California SB 478 & Canada Drip Pricing*)
- [ ] **Brak ukrytych dopłat obowiązkowych:** Żadna obowiązkowa opłata manipulacyjna (np. niezapowiedziane `$14.99 DDP Processing Fee` dodawane dopiero w ostatnim kroku przy jednoczesnym haśle *"100% Free All-Inclusive"* lub *"Duties Included"*) nie może zaskakiwać klienta w checkoucie.
- [ ] **Oznaczenie waluty:** Ceny dla USA mają jednoznaczne `USD` / `US$`, a dla Kanady `CAD` / `C$` (zakaz pokazywania Kanadyjkom ceny w USD opisanej samym symbolem `$`).

### 3. Oznakowanie Tekstyliów Online (*FTC Textile Act 16 CFR Part 303 & Canada Textile Labelling Act*)
- [ ] **Skład surowcowy w %:** Każda karta produktu bieliźnianego posiada jawnie wypisany skład włókien używający generycznych nazw FTC (np. `Polyamide / Nylon`, `Elastane / Spandex`, `Cotton`, `Polyester`).
- [ ] **Kraj pochodzenia:** Każda karta produktu wskazuje prawdziwy kraj produkcji (`Made in Poland` / `Country of Origin: Poland (EU)` lub `Imported`).

### 4. Weryfikacja Twierdzeń Reklamowych i Znaków Towarowych (*FTC Substantiation & Trademarks*)
- [ ] **Brak nieudokumentowanych twierdzeń:** Brak słów `handcrafted`, `handmade`, `tailored`, `medical`, `prevents irritation`, `bestseller` (gdy produkt ma 0 sprzedaży).
- [ ] **Brak zwrotów wykluczających obyczajowo:** Brak hasła `"for real women"`.
- [ ] **Ochrona znaków towarowych:** Nazwa linii `"Nike"` marki Gaia nie występuje w tytułach ani meta opisach na rynek USA/CA (zastąpiona kodem `Gaia BS 1135` / `GFB 1135`).
- [ ] **Ochrona recenzji (*FTC Consumer Reviews Rule*):** Wszystkie opinie pochodzą od realnych nabywców, brak sztucznych recenzji, brak blokowania negatywnych opinii.

### 5. Specyfika Kanadyjska (*Ontario CPA, Quebec CPA & Bill 96*)
- [ ] **Wymogi umów internetowych (Ontario & Quebec):** Przed złożeniem zamówienia klient widzi pełną nazwę sprzedawcy, adres fizyczny, e-mail oraz **numer telefonu**, pełną cenę w walucie, datę dostawy i warunki zwrotu, a po zakupie otrzymuje kopię umowy na trwałym nośniku (e-mail) w ciągu max 15 dni.
- [ ] **Quebec – Język Francuski (*Bill 96*):** Ścieżka zakupowa i warunki umowy dla kupujących z prowincji Quebec są dostępne w wersji `fr-CA`.

### 6. Prywatność, Cookies i Marketing (*RODO + CCPA/CPRA + PIPEDA/Law 25 + CASL + CAN-SPAM*)
- [ ] **Zgody marketingowe:** Checkbox zapisu do newslettera w checkoucie i formularzach jest **domyślnie odznaczony** (wymóg kanadyjskiego CASL i europejskiego RODO).
- [ ] **Sygnał GPC i Cookies:** Sklep respektuje nagłówek przeglądarki `Sec-GPC: 1` (*Global Privacy Control*) dla rezydentów USA oraz wymusza uprzednią zgodę (*opt-in*) na ciasteczka analityczne/reklamowe dla użytkowników z UE oraz Quebecu (*Law 25*).
- [ ] **Polityka Prywatności:** Wskazuje osobę odpowiedzialną za ochronę danych (wymóg *Quebec Law 25*), aktualnych odbiorców danych (w tym *DHL Express*) oraz prawa rezydentów USA i Kanady.

---

## 2. Procedura Uruchamiania Audytu (Jak Działa Agent)
1. **Krok 1:** Wczytaj plik wzorcowy [`backend/market_config.json`](../../../backend/market_config.json).
2. **Krok 2:** Pobierz aktualną treść stron informacyjnych i losowej próbki kart produktów z `https://naturaintimo.com` (zarówno wersji domyślnej, jak i `/en/`).
3. **Krok 3:** Przeskanuj zawartość względem `complianceBlacklists.forbiddenMarketingTerms`, sprawdź obecność sekcji *Fiber composition* i *Origin*, zweryfikuj kody statusów HTTP (brak 404 w menu) i spójność kwot dostawy.
4. **Krok 4:** Wygeneruj zwięzły raport `PASS / FAIL` ze wskazaniem dokładnego URL-a, linii i instrukcji naprawczej dla Kierownika Sklepu lub Inżyniera.
