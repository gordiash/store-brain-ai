import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

if (!ck || !cs) {
  throw new Error('Brak wymaganych poświadczeń WooCommerce w .env');
}

const authHeader = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');
const headers = { Authorization: authHeader };

// 1. Wczytanie konfiguracji rynków (Single Source of Truth)
const marketConfigPath = path.resolve('backend/market_config.json');
const marketConfig = JSON.parse(
  fs.readFileSync(fs.existsSync(marketConfigPath) ? marketConfigPath : path.resolve('market_config.json'), 'utf-8')
);

const EXPORTER_DATA = {
  name: 'Natura Izabela Jakubczyk',
  street: 'ul. Wesoła 1A',
  postalCode: '10-652',
  city: 'Olsztyn',
  country: 'Poland',
  countryCode: 'PL',
  nip: 'PL7621888669',
  eori: 'PL762188866900000',
  phone: marketConfig.supportContact?.phone || '+48 786 816 805',
  email: marketConfig.supportContact?.email || 'support@naturaintimo.com'
};

// 2. Przelicznik Walut NBP (Tabela A NBP – z cofaniem do ostatniego dnia roboczego)
export async function getNbpExchangeRate(currency, dateStr = new Date().toISOString().split('T')[0]) {
  const curr = currency.toUpperCase();
  if (curr === 'PLN') {
    return { rate: 1.0, tableNo: 'N/A', tableDate: dateStr };
  }

  let d = new Date(dateStr);
  // Sprawdzaj do 7 dni wstecz, aby ominąć weekendy i święta
  for (let i = 0; i < 7; i++) {
    const checkDate = d.toISOString().split('T')[0];
    const nbpUrl = `https://api.nbp.pl/api/exchangerates/rates/a/${curr.toLowerCase()}/${checkDate}/?format=json`;
    try {
      const res = await fetch(nbpUrl);
      if (res.ok) {
        const data = await res.json();
        return {
          rate: parseFloat(data.rates[0].mid),
          tableNo: data.rates[0].no,
          tableDate: data.rates[0].effectiveDate
        };
      }
    } catch (e) {
      // Błąd sieciowy – próbuj dzień wcześniej
    }
    d.setDate(d.getDate() - 1);
  }

  // Fallback awaryjny gdyby API NBP było offline
  const fallbackRates = { USD: 3.90, CAD: 2.75, EUR: 4.25 };
  return {
    rate: fallbackRates[curr] || 1.0,
    tableNo: 'FALLBACK/A/NBP',
    tableDate: dateStr
  };
}

// 3. Klasyfikacja podatkowa (B2C vs B2B) i detekcja NIP
export function classifyOrder(order) {
  let buyerNip = '';
  // Sprawdź metadane i pola bilingowe pod kątem NIP / Tax ID
  if (order.billing?.company && /\d{10}/.test(order.billing.company)) {
    buyerNip = order.billing.company.match(/\d{10}/)[0];
  }
  if (order.meta_data) {
    const nipMeta = order.meta_data.find(m => /nip|tax_id|vat_number/i.test(m.key));
    if (nipMeta && nipMeta.value) {
      buyerNip = String(nipMeta.value).trim();
    }
  }

  const country = order.shipping?.country || order.billing?.country || 'US';
  const isDomestic = country === 'PL';
  const isB2B = Boolean(buyerNip);

  return {
    isB2B,
    buyerNip,
    isDomestic,
    destinationCountry: country,
    ksefStatus: isB2B ? 'KSEF_REQUIRED_FA3' : 'B2C_EXEMPT_FROM_KSEF',
    vatRatePercent: isDomestic ? 23 : 0,
    vatLegalBasis: isDomestic ? 'Art. 41 ust. 1 ustawy o VAT' : 'Art. 41 ust. 4 ustawy o VAT (eksport towarów)'
  };
}

// 4. Generator KSeF FA(3) XML dla transakcji B2B (zgodny ze schemą Ministerstwa Finansów)
export function generateKsefFa3Xml(order, nbpData, classification) {
  const orderNum = order.id;
  const issueDate = (order.date_created || new Date().toISOString()).split('T')[0];
  const nowIso = new Date().toISOString();
  const currency = order.currency || 'PLN';
  const totalAmount = parseFloat(order.total || '0.00');
  const totalPln = (totalAmount * nbpData.rate).toFixed(2);

  const buyerName = order.billing?.company || `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim();
  const buyerStreet = order.billing?.address_1 || 'Brak ulicy';
  const buyerCity = order.billing?.city || 'Brak miasta';
  const buyerPostal = order.billing?.postcode || '00-000';
  const buyerCountry = order.billing?.country || 'PL';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Faktura xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Naglowek>
    <KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza>
    <WariantFormularza>3</WariantFormularza>
    <DataWytworzeniaFa>${nowIso}</DataWytworzeniaFa>
    <SystemInfo>Natura Intimo 0 PLN KSeF Engine v2.0</SystemInfo>
  </Naglowek>
  <Podmiot1>
    <DaneIdentyfikacyjne>
      <NIP>${EXPORTER_DATA.nip.replace('PL', '')}</NIP>
      <PelnaNazwa>${EXPORTER_DATA.name}</PelnaNazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      <AdresPol>
        <KodKraju>${EXPORTER_DATA.countryCode}</KodKraju>
        <Ulica>${EXPORTER_DATA.street}</Ulica>
        <NrDomu>26</NrDomu>
        <Miejscowosc>${EXPORTER_DATA.city}</Miejscowosc>
        <KodPocztowy>${EXPORTER_DATA.postalCode}</KodPocztowy>
      </AdresPol>
    </Adres>
  </Podmiot1>
  <Podmiot2>
    <DaneIdentyfikacyjne>
      <NIP>${classification.buyerNip.replace(/[^0-9]/g, '')}</NIP>
      <PelnaNazwa>${buyerName}</PelnaNazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      ${buyerCountry === 'PL' ? `
      <AdresPol>
        <KodKraju>PL</KodKraju>
        <Ulica>${buyerStreet}</Ulica>
        <Miejscowosc>${buyerCity}</Miejscowosc>
        <KodPocztowy>${buyerPostal}</KodPocztowy>
      </AdresPol>` : `
      <AdresZagr>
        <KodKraju>${buyerCountry}</KodKraju>
        <Ulica>${buyerStreet}</Ulica>
        <Miejscowosc>${buyerCity}</Miejscowosc>
        <KodPocztowy>${buyerPostal}</KodPocztowy>
      </AdresZagr>`}
    </Adres>
  </Podmiot2>
  <Fa>
    <KodWaluty>${currency}</KodWaluty>
    <P_1>${issueDate}</P_1>
    <P_2>FV/${orderNum}/${issueDate.replace(/-/g, '')}</P_2>
    <P_6>${issueDate}</P_6>
    <P_13_1>${classification.isDomestic ? (totalAmount / 1.23).toFixed(2) : '0.00'}</P_13_1>
    <P_14_1>${classification.isDomestic ? (totalAmount - totalAmount / 1.23).toFixed(2) : '0.00'}</P_14_1>
    <P_13_6>${!classification.isDomestic ? totalAmount.toFixed(2) : '0.00'}</P_13_6>
    <P_15>${totalAmount.toFixed(2)}</P_15>
    <Adnotacje>
      <P_16>2</P_16>
      <P_17>2</P_17>
      <P_18>2</P_18>
      <P_19>2</P_19>
      <P_22>2</P_22>
      <P_23>2</P_23>
      <P_PMarzy>2</P_PMarzy>
    </Adnotacje>
    <DodatkowyOpis>
      <Klucz>NBP_EXCHANGE_RATE</Klucz>
      <Wartosc>Kurs NBP: 1 ${currency} = ${nbpData.rate} PLN (Tabela ${nbpData.tableNo} z dnia ${nbpData.tableDate}). Wartość w PLN: ${totalPln} PLN</Wartosc>
    </DodatkowyOpis>
  </Fa>
</Faktura>`;

  return xml;
}

// 5. Generator Imiennej Faktury Konsumenckiej B2C (HTML gotowy do wydruku / PDF)
export function generateB2cConsumerInvoiceHtml(order, nbpData, classification) {
  const orderNum = order.id;
  const issueDate = (order.date_created || new Date().toISOString()).split('T')[0];
  const currency = order.currency || 'USD';
  const total = parseFloat(order.total || '0.00');
  const totalPln = (total * nbpData.rate).toFixed(2);
  const vatRate = classification.vatRatePercent;

  const buyerName = `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim() || 'Private Consumer';
  const buyerAddress = `${order.billing?.address_1 || ''}, ${order.billing?.city || ''}, ${order.billing?.state || ''} ${order.billing?.postcode || ''}, ${order.billing?.country || ''}`;

  const rowsHtml = (order.line_items || []).map((item, idx) => {
    const itemTotal = parseFloat(item.total);
    const itemTotalPln = (itemTotal * nbpData.rate).toFixed(2);
    return `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee;">${idx + 1}</td>
        <td style="padding:10px; border-bottom:1px solid #eee;"><strong>${item.name}</strong><br><small style="color:#777;">SKU: ${item.sku || 'N/A'}</small></td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${currency} ${(itemTotal / item.quantity).toFixed(2)}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${currency} ${itemTotal.toFixed(2)}<br><small style="color:#777;">(${itemTotalPln} PLN)</small></td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${vatRate}%</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <title>Faktura Imienna B2C #${orderNum} – Natura Intimo</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #30252b; margin: 40px; background: #fff; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #30252b; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: 700; letter-spacing: 0.05em; }
    .doc-title { font-size: 20px; font-weight: 700; color: #93566a; text-align: right; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .party-box { width: 48%; background: #fffaf7; padding: 18px; border-radius: 12px; border: 1px solid #ebdce1; }
    .party-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #93566a; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #30252b; color: #fff; padding: 10px; text-align: left; font-size: 13px; font-weight: 600; }
    .totals { margin-left: auto; width: 350px; background: #fffaf7; border: 1.5px solid #ebdce1; border-radius: 12px; padding: 18px; }
    .tot-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .tot-row.grand { font-size: 18px; font-weight: 700; border-top: 1.5px solid #ebdce1; padding-top: 8px; margin-top: 8px; color: #30252b; }
    .legal-notice { margin-top: 30px; padding: 14px; background: #fdf2f4; border-radius: 10px; font-size: 12px; color: #5c4752; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">NATURA INTIMO</div>
      <div style="font-size:13px; color:#666;">Luksusowa Bielizna Europejska · Brafitting</div>
    </div>
    <div class="doc-title">
      FAKTURA KONSUMENCKA B2C<br>
      <span style="font-size:14px; color:#555;">Nr: NI-B2C/${orderNum}/${issueDate.replace(/-/g, '')}</span>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <div class="party-title">Sprzedawca (Seller / Exporter):</div>
      <strong>${EXPORTER_DATA.name}</strong><br>
      ${EXPORTER_DATA.street}<br>
      ${EXPORTER_DATA.postalCode} ${EXPORTER_DATA.city}, Polska<br>
      NIP: ${EXPORTER_DATA.nip} · EORI: ${EXPORTER_DATA.eori}<br>
      Email: ${EXPORTER_DATA.email} · Tel: ${EXPORTER_DATA.phone}
    </div>
    <div class="party-box">
      <div class="party-title">Nabywca (Customer / Consignee):</div>
      <strong>${buyerName}</strong><br>
      ${buyerAddress}<br>
      Email: ${order.billing?.email || 'N/A'}<br>
      Kraj dostawy: ${classification.destinationCountry}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px;">Lp.</th>
        <th>Nazwa towaru / usugi</th>
        <th style="width:60px; text-align:center;">Ilość</th>
        <th style="width:110px; text-align:right;">Cena jedn.</th>
        <th style="width:140px; text-align:right;">Wartość brutto</th>
        <th style="width:80px; text-align:center;">Stawka VAT</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="tot-row">
      <span>Razem (${currency}):</span>
      <strong>${currency} ${total.toFixed(2)}</strong>
    </div>
    <div class="tot-row">
      <span>Średni kurs NBP:</span>
      <span>1 ${currency} = ${nbpData.rate} PLN</span>
    </div>
    <div class="tot-row">
      <span>Tabela NBP:</span>
      <span>${nbpData.tableNo} (${nbpData.tableDate})</span>
    </div>
    <div class="tot-row grand">
      <span>Do zapłaty (PLN):</span>
      <span>${totalPln} PLN</span>
    </div>
  </div>

  <div class="legal-notice">
    <strong>Podstawa prawna i adnotacje podatkowe:</strong><br>
    • Transakcja konsumencka B2C — zgodnie z ustawą o podatku od towarów i usług zwolniona z obowiązku przesyłania do Krajowego Systemu e-Faktur (KSeF).<br>
    • ${classification.vatLegalBasis}. Podatek VAT należny: ${classification.isDomestic ? (total - total / 1.23).toFixed(2) + ' PLN' : '0,00 PLN'}.<br>
    • Warunki dostawy: ${classification.destinationCountry === 'PL' ? 'Krajowa' : 'DDP / DAP (Incoterms 2020) via DHL Express'}.
  </div>
</body>
</html>`;
}

// 6. Generator Commercial Invoice dla DHL Express (USA & Kanada)
export function generateCommercialInvoiceHtml(order, madaProductsMap, nbpData) {
  const orderNum = order.id;
  const issueDate = (order.date_created || new Date().toISOString()).split('T')[0];
  const currency = order.currency || 'USD';
  const destCountry = order.shipping?.country || order.billing?.country || 'US';
  const isCanada = destCountry === 'CA';

  const consigneeName = `${order.shipping?.first_name || order.billing?.first_name || ''} ${order.shipping?.last_name || order.billing?.last_name || ''}`.trim() || 'Private Consignee';
  const consigneeStreet = order.shipping?.address_1 || order.billing?.address_1 || '';
  const consigneeCity = order.shipping?.city || order.billing?.city || '';
  const consigneeState = order.shipping?.state || order.billing?.state || '';
  const consigneePostal = order.shipping?.postcode || order.billing?.postcode || '';
  const consigneePhone = order.billing?.phone || '+1 000 000 0000';
  const consigneeEmail = order.billing?.email || 'support@naturaintimo.com';

  const usDdpThreshold = marketConfig.markets?.US?.freeDutiesThreshold || 150.00;
  const incoterm = (!isCanada && parseFloat(order.total || 0) >= usDdpThreshold) ? 'DDP' : 'DAP';

  // Rozbijanie pozycji i przypisywanie HTS, składu surowcowego i wagi
  const items = [];
  let totalNetWeightKg = 0;
  let totalDeclaredValue = 0;

  for (const rawItem of (order.line_items || [])) {
    const name = rawItem.name || '';
    const isBra = /\b(bra|biustonosz|semi-soft|soft|full cup|push-up)\b/i.test(name) && !/brazilian|brazyliany/i.test(name);
    
    // Kod HTS wg komponentu
    const htsCode = isBra 
      ? (marketConfig.customsAndHts?.componentHtsMapping?.bra_synthetic?.htsUs || '6212.10.9020')
      : (marketConfig.customsAndHts?.componentHtsMapping?.panty_synthetic_knit?.htsUs || '6108.22.9020');
    
    const weightPerUnit = isBra ? 0.09 : 0.04;
    
    const qty = rawItem.quantity || 1;
    const unitPrice = parseFloat(rawItem.total) / qty;
    const totalLineValue = parseFloat(rawItem.total);
    const lineNetWeight = weightPerUnit * qty;

    totalNetWeightKg += lineNetWeight;
    totalDeclaredValue += totalLineValue;

    // Próba odnalezienia składu surowcowego z metadanych pozycji lub madaProductsMap
    let materialComp = '80% Polyamide, 20% Elastane';
    const meta = rawItem.meta_data?.find(m => m.key === '_material_composition');
    if (meta && meta.value) {
      materialComp = meta.value;
    } else if (madaProductsMap && rawItem.product_id && madaProductsMap[rawItem.product_id]) {
      const prodMeta = madaProductsMap[rawItem.product_id].meta_data?.find(m => m.key === '_material_composition');
      if (prodMeta && prodMeta.value) materialComp = prodMeta.value;
    }

    items.push({
      description: isBra
        ? `Women's Knitted Brassiere with Underwire – ${name} (${materialComp})`
        : `Women's Knitted Briefs/Panties – ${name} (${materialComp})`,
      htsCode,
      qty,
      unitPrice: unitPrice.toFixed(2),
      totalValue: totalLineValue.toFixed(2),
      netWeightKg: lineNetWeight.toFixed(2),
      countryOfOrigin: 'PL'
    });
  }

  const itemsRowsHtml = items.map((it, idx) => `
    <tr>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${idx + 1}</td>
      <td style="padding:8px; border:1px solid #ddd;">
        <strong>${it.description}</strong>
      </td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center; font-family:monospace;">${it.htsCode}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${it.countryOfOrigin}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${it.qty} PCS</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${it.netWeightKg} kg</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${currency} $${it.unitPrice}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right; font-weight:600;">${currency} $${it.totalValue}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Commercial Invoice #${orderNum} – DHL Express Export – Natura Intimo</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 30px; line-height: 1.4; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: bold; text-transform: uppercase; }
    .grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
    .col { width: 48%; border: 1px solid #ccc; padding: 12px; border-radius: 4px; background: #fafafa; }
    .col-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #555; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #eee; padding: 8px; font-size: 11px; border: 1px solid #ddd; text-transform: uppercase; }
    .ceta-box { background: #f0f7ff; border: 1.5px solid #0066cc; padding: 14px; border-radius: 6px; margin-bottom: 20px; }
    .ceta-title { font-weight: bold; color: #0066cc; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; }
    .sign-box { display: flex; justify-content: space-between; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">COMMERCIAL INVOICE</div>
      <div style="font-size:12px; color:#444;">FOR CUSTOMS CLEARANCE & AIR EXPRESS TRANSPORT</div>
    </div>
    <div style="text-align:right;">
      <strong>Invoice No:</strong> EXP-DHL-${orderNum}<br>
      <strong>Date:</strong> ${issueDate}<br>
      <strong>Air Waybill (AWB):</strong> [ATTACHED DHL AWB]<br>
      <strong>Incoterms 2020:</strong> <strong>${incoterm} ${consigneeCity}, ${destCountry}</strong>
    </div>
  </div>

  <div class="grid">
    <div class="col">
      <div class="col-title">Shipper / Exporter (Nadawca):</div>
      <strong>${EXPORTER_DATA.name}</strong><br>
      ${EXPORTER_DATA.street}<br>
      ${EXPORTER_DATA.postalCode} ${EXPORTER_DATA.city}, ${EXPORTER_DATA.country}<br>
      <strong>VAT/Tax ID:</strong> ${EXPORTER_DATA.nip}<br>
      <strong>EORI Number:</strong> ${EXPORTER_DATA.eori}<br>
      <strong>Contact:</strong> ${EXPORTER_DATA.email} | ${EXPORTER_DATA.phone}
    </div>
    <div class="col">
      <div class="col-title">Consignee / Importer of Record (Odbiorca):</div>
      <strong>${consigneeName}</strong><br>
      ${consigneeStreet}<br>
      ${consigneeCity}, ${consigneeState} ${consigneePostal}<br>
      ${destCountry === 'CA' ? 'Canada' : 'United States'}<br>
      <strong>Phone:</strong> ${consigneePhone}<br>
      <strong>Email:</strong> ${consigneeEmail}
    </div>
  </div>

  <div style="margin-bottom: 12px; font-size: 11px;">
    <strong>Reason for Export:</strong> Permanent Commercial Sale to Consumer (E-Commerce B2C) &nbsp;|&nbsp; 
    <strong>Carrier:</strong> DHL Express Worldwide &nbsp;|&nbsp; 
    <strong>Currency:</strong> ${currency}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th>Full Description of Goods (Fiber Composition)</th>
        <th style="width:90px;">HTS Code</th>
        <th style="width:40px;">Origin</th>
        <th style="width:50px;">Qty</th>
        <th style="width:75px;">Net Wt</th>
        <th style="width:80px;">Unit Price</th>
        <th style="width:85px;">Total Value</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRowsHtml}
    </tbody>
    <tfoot>
      <tr style="background:#f9f9f9; font-weight:bold;">
        <td colspan="5" style="padding:10px; border:1px solid #ddd; text-align:right;">TOTAL DECLARED VALUE & WEIGHT:</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:right;">${totalNetWeightKg.toFixed(2)} kg</td>
        <td style="padding:10px; border:1px solid #ddd;"></td>
        <td style="padding:10px; border:1px solid #ddd; text-align:right; font-size:14px; color:#93566a;">${currency} $${totalDeclaredValue.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  ${isCanada ? `
  <div class="ceta-box">
    <div class="ceta-title">🇨🇦 CETA Origin Declaration (Canada–European Union Comprehensive Economic and Trade Agreement):</div>
    <em>"The exporter of the products covered by this document (Exporter Reference / EORI No. <strong>${EXPORTER_DATA.eori}</strong>) declares that, except where otherwise clearly indicated, these products are of <strong>EU (Poland) preferential origin</strong>."</em><br>
    <div style="margin-top:6px; font-size:11px; color:#333;">
      Place & Date: Olsztyn, Poland, ${issueDate} &nbsp;|&nbsp; Exporter: Natura Izabela Jakubczyk
    </div>
  </div>` : ''}

  <div class="sign-box">
    <div style="width:65%; font-size:11px; color:#555;">
      I hereby certify that the information contained on this invoice is true, complete and correct, and that the contents and value of this shipment are strictly as declared above.<br>
      No forbidden materials or undisclosed hazardous goods are contained herein.
    </div>
    <div style="width:30%; text-align:right;">
      <div style="border-bottom:1px solid #000; height:40px;"></div>
      <strong>Natura Izabela Jakubczyk</strong><br>
      <small>Authorized Signature / Owner</small>
    </div>
  </div>
</body>
</html>`;
}

// 7. Ewidencja 0% VAT (IE-599) i Monitor Progow Economic Nexus / GST
export function updateVat0AndNexusRegistry(order, nbpData, classification) {
  const invoicesDir = fs.existsSync(path.resolve('backend')) ? path.resolve('backend/invoices') : path.resolve('invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  const registryFile = path.join(invoicesDir, 'export_vat0_registry.json');
  let registry = {
    metadata: {
      lastUpdated: new Date().toISOString(),
      exporter: EXPORTER_DATA.name,
      eori: EXPORTER_DATA.eori
    },
    exportShipmentsAwaitingIe599: [],
    nexusStateMonitoringUs: {},
    gstMonitoringCanadaCad: {
      thresholdCad: 30000,
      currentSalesCad: 0,
      percentOfThreshold: 0
    }
  };

  if (fs.existsSync(registryFile)) {
    try {
      registry = JSON.parse(fs.readFileSync(registryFile, 'utf-8'));
    } catch (e) {
      console.warn('Inicjalizacja nowego rejestru VAT 0%');
    }
  }

  const country = classification.destinationCountry;
  const isExport = country !== 'PL';
  const orderNum = order.id;
  const totalForeign = parseFloat(order.total || '0.00');
  const currency = order.currency || 'USD';
  const totalPln = parseFloat((totalForeign * nbpData.rate).toFixed(2));

  if (isExport) {
    const existing = registry.exportShipmentsAwaitingIe599.find(s => s.orderId === orderNum);
    if (!existing) {
      registry.exportShipmentsAwaitingIe599.push({
        orderId: orderNum,
        invoiceNumber: `EXP-DHL-${orderNum}`,
        orderDate: (order.date_created || new Date().toISOString()).split('T')[0],
        destinationCountry: country,
        state: order.shipping?.state || order.billing?.state || 'N/A',
        currency,
        amountForeign: totalForeign,
        exchangeRateNbp: nbpData.rate,
        tableNoNbp: nbpData.tableNo,
        amountPln: totalPln,
        vatRate: '0%',
        vat0ProofStatus: 'AWAITING_IE599_OR_DHL_EXPORT_CONFIRMATION',
        carrier: 'DHL_EXPRESS_WORLDWIDE',
        ie599DocumentNumber: null,
        ie599ReceivedDate: null
      });
    }

    // Monitor Economic Nexus US
    if (country === 'US') {
      const state = (order.shipping?.state || order.billing?.state || 'US-OTHER').toUpperCase();
      if (!registry.nexusStateMonitoringUs[state]) {
        registry.nexusStateMonitoringUs[state] = {
          stateCode: state,
          totalSalesUsd: 0,
          totalOrdersCount: 0,
          nexusThresholdUsd: 100000,
          warningTriggered: false
        };
      }
      registry.nexusStateMonitoringUs[state].totalSalesUsd = parseFloat((registry.nexusStateMonitoringUs[state].totalSalesUsd + totalForeign).toFixed(2));
      registry.nexusStateMonitoringUs[state].totalOrdersCount += 1;
      if (registry.nexusStateMonitoringUs[state].totalSalesUsd >= 70000) {
        registry.nexusStateMonitoringUs[state].warningTriggered = true;
      }
    }

    // Monitor GST Kanada
    if (country === 'CA') {
      const amountCad = currency === 'CAD' ? totalForeign : totalForeign * 1.36; // Przybliżenie USD->CAD
      registry.gstMonitoringCanadaCad.currentSalesCad = parseFloat((registry.gstMonitoringCanadaCad.currentSalesCad + amountCad).toFixed(2));
      registry.gstMonitoringCanadaCad.percentOfThreshold = parseFloat(((registry.gstMonitoringCanadaCad.currentSalesCad / registry.gstMonitoringCanadaCad.thresholdCad) * 100).toFixed(2));
    }
  }

  fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2), 'utf-8');
  return registry;
}

// 8. Główny orkiestrator generowania dokumentów dla zamówień
export async function processAllInvoicesAndCustoms() {
  console.log('--- Rozpoczynam generowanie dokumentów księgowo-eksportowych 0 PLN ---');
  const invoicesDir = path.resolve('backend/invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  // Pobierz zamówienia z WooCommerce
  console.log('Pobieram zamówienia z WooCommerce...');
  const res = await fetch(`${url}/wp-json/wc/v3/orders?per_page=20`, { headers });
  if (!res.ok) {
    throw new Error(`Błąd pobierania zamówień: HTTP ${res.status}`);
  }
  const orders = await res.json();
  console.log(`Pobrano ${orders.length} zamówień do przetworzenia.`);

  const summary = {
    processedCount: orders.length,
    b2cInvoicesCreated: 0,
    ksefXmlCreated: 0,
    commercialInvoicesCreated: 0,
    filesCreated: []
  };

  for (const order of orders) {
    const classification = classifyOrder(order);
    const currency = order.currency || (classification.isDomestic ? 'PLN' : 'USD');
    const orderDate = (order.date_created || new Date().toISOString()).split('T')[0];

    // Pobierz oficjalny kurs NBP
    const nbpData = await getNbpExchangeRate(currency, orderDate);
    console.log(`Zamówienie #${order.id} (${classification.destinationCountry}, ${currency}) -> Kurs NBP: 1 ${currency} = ${nbpData.rate} PLN (${nbpData.tableNo})`);

    // A. B2C vs B2B
    if (classification.isB2B) {
      console.log(`-> Wykryto B2B (NIP: ${classification.buyerNip}). Generowanie XML KSeF FA(3)...`);
      const ksefXml = generateKsefFa3Xml(order, nbpData, classification);
      const ksefPath = path.join(invoicesDir, `ksef_fa3_order_${order.id}.xml`);
      fs.writeFileSync(ksefPath, ksefXml, 'utf-8');
      summary.ksefXmlCreated++;
      summary.filesCreated.push(ksefPath);
    } else {
      console.log(`-> Wykryto B2C (${classification.ksefStatus}). Generowanie Faktury Konsumenckiej...`);
      const b2cHtml = generateB2cConsumerInvoiceHtml(order, nbpData, classification);
      const b2cPath = path.join(invoicesDir, `invoice_consumer_order_${order.id}.html`);
      fs.writeFileSync(b2cPath, b2cHtml, 'utf-8');
      summary.b2cInvoicesCreated++;
      summary.filesCreated.push(b2cPath);
    }

    // B. Commercial Invoice dla USA i Kanady
    if (!classification.isDomestic) {
      console.log(`-> Eksport poza UE (${classification.destinationCountry}). Generowanie DHL Commercial Invoice...`);
      const commHtml = generateCommercialInvoiceHtml(order, null, nbpData);
      const commPath = path.join(invoicesDir, `commercial_invoice_order_${order.id}.html`);
      fs.writeFileSync(commPath, commHtml, 'utf-8');
      summary.commercialInvoicesCreated++;
      summary.filesCreated.push(commPath);
    }

    // C. Rejestr 0% VAT i Nexus
    updateVat0AndNexusRegistry(order, nbpData, classification);
  }

  console.log('--- Zakończono generowanie dokumentacji księgowo-celnej ---');
  console.log(`Podsumowanie: Utworzono ${summary.b2cInvoicesCreated} faktur konsumenckich B2C, ${summary.ksefXmlCreated} plików KSeF FA(3) XML, ${summary.commercialInvoicesCreated} dokumentów Commercial Invoice.`);
  console.log(`Pliki zapisano w: ${invoicesDir}`);
  return summary;
}

// Uruchomienie bezpośrednie
if (process.argv[1] && process.argv[1].endsWith('accounting_export_engine.js')) {
  processAllInvoicesAndCustoms().catch(err => {
    console.error('Błąd silnika księgowo-eksportowego:', err);
    process.exit(1);
  });
}
