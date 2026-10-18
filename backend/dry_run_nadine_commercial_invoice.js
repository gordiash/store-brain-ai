import fs from 'fs';
import path from 'path';
import {
  getNbpExchangeRate,
  classifyOrder,
  generateB2cConsumerInvoiceHtml,
  generateKsefFa3Xml,
  updateVat0AndNexusRegistry
} from './accounting_export_engine.js';

const marketConfigPath = fs.existsSync('market_config.json')
  ? 'market_config.json'
  : path.resolve('backend/market_config.json');
const marketConfig = JSON.parse(fs.readFileSync(marketConfigPath, 'utf-8'));

const EXPORTER = {
  name: marketConfig.seller.legalName,
  brand: marketConfig.seller.brandName,
  street: marketConfig.seller.address.street,
  postalCode: marketConfig.seller.address.postalCode,
  city: marketConfig.seller.address.city,
  country: marketConfig.seller.address.country,
  countryCode: marketConfig.seller.countryCode,
  nip: 'PL' + marketConfig.seller.taxIdNip,
  eori: 'PL' + marketConfig.seller.taxIdNip + '00000',
  email: marketConfig.seller.contact.supportEmail,
  phone: '+48 786 816 805'
};

/**
 * Proporcjonalna alokacja rabatu zestawowego (-$10.00 Set Savings) na poszczególne pozycje HTS
 * Zgodnie z wymogiem US CBP i Canada CBSA: zakaz ujemnych linii rabatowych bez przypisania do kodu HTS.
 */
export function allocateProportionalSetDiscount(rawItems, bundleDiscountAmount = 10.00) {
  const grossSubtotal = rawItems.reduce((acc, it) => acc + it.catalogUnitPrice * it.qty, 0);
  const netTargetTotal = Number((grossSubtotal - bundleDiscountAmount).toFixed(2));

  let allocatedDiscountSoFar = 0;
  const processedItems = rawItems.map((it, idx) => {
    const lineGross = Number((it.catalogUnitPrice * it.qty).toFixed(2));
    let lineDiscount = 0;
    if (idx < rawItems.length - 1) {
      lineDiscount = Number(((lineGross / grossSubtotal) * bundleDiscountAmount).toFixed(2));
      allocatedDiscountSoFar = Number((allocatedDiscountSoFar + lineDiscount).toFixed(2));
    } else {
      // Ostatnia pozycja domyka rabat co do centa
      lineDiscount = Number((bundleDiscountAmount - allocatedDiscountSoFar).toFixed(2));
    }
    const lineNetTotal = Number((lineGross - lineDiscount).toFixed(2));
    const netUnitPrice = Number((lineNetTotal / it.qty).toFixed(2));

    return {
      ...it,
      lineGross: lineGross.toFixed(2),
      allocatedDiscount: lineDiscount.toFixed(2),
      netUnitPrice: netUnitPrice.toFixed(2),
      lineNetTotal: lineNetTotal.toFixed(2),
      totalNetWeightKg: (it.unitWeightKg * it.qty).toFixed(2)
    };
  });

  const sumNetCheck = processedItems.reduce((acc, it) => acc + parseFloat(it.lineNetTotal), 0).toFixed(2);

  return {
    grossSubtotal: grossSubtotal.toFixed(2),
    bundleDiscountAmount: bundleDiscountAmount.toFixed(2),
    netTargetTotal: netTargetTotal.toFixed(2),
    sumNetCheck,
    exactCentMatch: sumNetCheck === netTargetTotal.toFixed(2),
    items: processedItems
  };
}

function buildDhlCommercialInvoiceNadineHtml({
  invoiceNo,
  issueDate,
  currency,
  displaySymbol,
  destCountry,
  consignee,
  incoterms,
  shippingCost,
  allocationResult,
  nbpData
}) {
  const isCanada = destCountry === 'CA';
  const totalWeightKg = allocationResult.items
    .reduce((acc, it) => acc + parseFloat(it.totalNetWeightKg), 0)
    .toFixed(2);
  const totalGoodsForeign = parseFloat(allocationResult.netTargetTotal);
  const totalInvoiceWithShipping = (totalGoodsForeign + shippingCost).toFixed(2);
  const totalGoodsPln = (totalGoodsForeign * nbpData.rate).toFixed(2);

  const rowsHtml = allocationResult.items.map((it, i) => `
    <tr>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${i + 1}</td>
      <td style="padding:8px; border:1px solid #ddd;">
        <strong>${it.customsDescription}</strong><br>
        <small style="color:#444;">
          Brand: ${it.brand} | Model: ${it.modelCode} | SKU: ${it.sku} | WC ID: #${it.wcId}<br>
          Fiber Composition: <strong>${it.materialComposition}</strong><br>
          Catalog Price: ${displaySymbol}${it.lineGross} &minus; Proportional Set Discount: ${displaySymbol}${it.allocatedDiscount}
        </small>
      </td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center; font-family:monospace; font-weight:bold;">${it.htsCode}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:bold;">${it.countryOfOrigin}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${it.qty} PCS</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${it.totalNetWeightKg} kg</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${currency} ${displaySymbol}${it.netUnitPrice}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right; font-weight:700;">${currency} ${displaySymbol}${it.lineNetTotal}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Commercial Invoice ${invoiceNo} – Gorsenia Nadine Set (DHL Express) – Natura Intimo</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 30px; line-height: 1.45; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: bold; text-transform: uppercase; }
    .grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
    .col { width: 48%; border: 1px solid #ccc; padding: 12px; border-radius: 4px; background: #fafafa; }
    .col-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #555; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    th { background: #eee; padding: 8px; font-size: 11px; border: 1px solid #ddd; text-transform: uppercase; }
    .ceta-box { background: #f0f7ff; border: 1.5px solid #0066cc; padding: 14px; border-radius: 6px; margin-bottom: 18px; }
    .ceta-title { font-weight: bold; color: #0066cc; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; }
    .nbp-box { background: #fdfaf6; border: 1px solid #e2d5c8; padding: 12px; border-radius: 6px; margin-bottom: 18px; font-size: 11px; }
    .sign-box { display: flex; justify-content: space-between; margin-top: 26px; border-top: 1px solid #ccc; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">COMMERCIAL INVOICE (CUSTOMS DRY-RUN)</div>
      <div style="font-size:12px; color:#444;">FOR DHL EXPRESS WORLDWIDE CLEARANCE (${destCountry === 'CA' ? 'CBSA CANADA' : 'U.S. CBP'})</div>
    </div>
    <div style="text-align:right;">
      <strong>Invoice No:</strong> ${invoiceNo}<br>
      <strong>Date:</strong> ${issueDate}<br>
      <strong>Air Waybill (AWB):</strong> DHL-AWB-SIM-${invoiceNo}<br>
      <strong>Incoterms 2020:</strong> <strong>${incoterms} ${consignee.city}, ${destCountry}</strong>
    </div>
  </div>

  <div class="grid">
    <div class="col">
      <div class="col-title">Shipper / Exporter (Nadawca / Eksporter):</div>
      <strong>${EXPORTER.name} (${EXPORTER.brand})</strong><br>
      ${EXPORTER.street}<br>
      ${EXPORTER.postalCode} ${EXPORTER.city}, ${EXPORTER.country}<br>
      <strong>VAT / NIP:</strong> ${EXPORTER.nip}<br>
      <strong>EORI Number:</strong> ${EXPORTER.eori}<br>
      <strong>Contact:</strong> ${EXPORTER.email} | ${EXPORTER.phone}
    </div>
    <div class="col">
      <div class="col-title">Consignee / Importer of Record (Odbiorca):</div>
      <strong>${consignee.name}</strong><br>
      ${consignee.street}<br>
      ${consignee.city}, ${consignee.state} ${consignee.postalCode}<br>
      ${consignee.countryName}<br>
      <strong>Phone:</strong> ${consignee.phone}<br>
      <strong>Email:</strong> ${consignee.email}
    </div>
  </div>

  <div style="margin-bottom: 12px; font-size: 11px;">
    <strong>Reason for Export:</strong> Permanent Commercial Sale to Consumer (E-Commerce B2C) &nbsp;|&nbsp;
    <strong>Carrier:</strong> DHL Express Worldwide &nbsp;|&nbsp;
    <strong>Currency:</strong> ${currency} (${displaySymbol}) &nbsp;|&nbsp;
    <strong>Set Splitting Compliance:</strong> Coordinated Set Itemized by Component HTS (No Single Set HTS 6212.90)
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:28px;">#</th>
        <th>Full Description of Goods (Fiber Composition, Brand, Model & Proportional Discount)</th>
        <th style="width:95px;">HTS Code</th>
        <th style="width:45px;">Origin</th>
        <th style="width:50px;">Qty</th>
        <th style="width:65px;">Net Wt</th>
        <th style="width:95px;">Net Unit Price</th>
        <th style="width:100px;">Total Net Value</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
    <tfoot>
      <tr style="background:#fcfcfc;">
        <td colspan="5" style="padding:8px; border:1px solid #ddd; text-align:right;">
          Subtotal Goods (Before Set Savings: ${currency} ${displaySymbol}${allocationResult.grossSubtotal} &minus; Bundle Discount: ${currency} ${displaySymbol}${allocationResult.bundleDiscountAmount}):
        </td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right; font-weight:bold;">${totalWeightKg} kg</td>
        <td style="padding:8px; border:1px solid #ddd;"></td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right; font-weight:bold;">${currency} ${displaySymbol}${allocationResult.netTargetTotal}</td>
      </tr>
      <tr style="background:#fcfcfc;">
        <td colspan="7" style="padding:8px; border:1px solid #ddd; text-align:right;">
          DHL Express Worldwide Shipping (${incoterms} Flat Rate per market_config.json):
        </td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right;">${currency} ${displaySymbol}${shippingCost.toFixed(2)}</td>
      </tr>
      <tr style="background:#f4ede2; font-weight:bold;">
        <td colspan="5" style="padding:10px; border:1px solid #ddd; text-align:right;">TOTAL DECLARED CUSTOMS VALUE OF GOODS &amp; TOTAL INVOICE PAID:</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:right;">${totalWeightKg} kg</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:right;">Goods: ${displaySymbol}${allocationResult.netTargetTotal}</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:right; font-size:13px; color:#8e4f63;">Total: ${currency} ${displaySymbol}${totalInvoiceWithShipping}</td>
      </tr>
    </tfoot>
  </table>

  ${isCanada ? `
  <div class="ceta-box">
    <div class="ceta-title">🇨🇦 Canada–European Union Comprehensive Economic and Trade Agreement (CETA) Origin Declaration (0% Preferential Duty):</div>
    <em>"The exporter of the products covered by this document (Exporter Reference / EORI No. <strong>${EXPORTER.eori}</strong>) declares that, except where otherwise clearly indicated, these products are of <strong>EU (Poland) preferential origin</strong>."</em><br>
    <div style="margin-top:6px; font-size:11px; color:#222;">
      <strong>Place and Date:</strong> Olsztyn, Poland, ${issueDate} &nbsp;|&nbsp; <strong>Signature:</strong> ${EXPORTER.name}
    </div>
  </div>` : ''}

  <div class="nbp-box">
    <strong>🇵🇱 Adnotacja Księgowo-Podatkowa (Polska Ewidencja VAT 0% Eksport Towarów – Art. 31a ust. 1 i Art. 41 ust. 4 ustawy o VAT):</strong><br>
    • Kurs przeliczeniowy NBP: <strong>1 ${currency} = ${nbpData.rate.toFixed(4)} PLN</strong> (Tabela nr <strong>${nbpData.tableNo}</strong> z dnia <strong>${nbpData.tableDate}</strong> — ostatni dzień roboczy poprzedzający obowiązek podatkowy).<br>
    • Wartość netto towarów po rabacie w PLN: <strong>${totalGoodsPln} PLN</strong> (Wartość całkowita z wysyłką: <strong>${((totalGoodsForeign + shippingCost) * nbpData.rate).toFixed(2)} PLN</strong>).<br>
    • Kwota podatku VAT: <strong>0,00 PLN (stawka 0% VAT – eksport towarów poza terytorium UE, potwierdzany komunikatem celnym IE-599 / CC599C od DHL Express)</strong>.
  </div>

  <div class="sign-box">
    <div style="width:65%; font-size:11px; color:#555;">
      I hereby certify that the information on this invoice is true and correct, that the coordinated set has been itemized into individual garment HTS codes with proportional discount allocation, and that all garments were manufactured in Poland (European Union).
    </div>
    <div style="width:30%; text-align:right;">
      <div style="border-bottom:1px solid #000; height:32px;"></div>
      <strong>${EXPORTER.name}</strong><br>
      <small>Authorized Exporter Signature</small>
    </div>
  </div>
</body>
</html>`;
}

async function runDryRunSimulation() {
  console.log('================================================================================');
  console.log('🧾 ZADANIE 6: DRY-RUN SYMULACJI COMMERCIAL INVOICE (DHL EXPRESS) + CETA + NBP + KSeF');
  console.log('   Komplet: Gorsenia Nadine Soft Bra (#3874) + Gorsenia Nadine Panties (#3932)');
  console.log('================================================================================');

  const issueDate = '2026-10-17';

  // 1. Pobierz kursy walut USD i CAD z API NBP (ostatni dzień roboczy przed 2026-10-17)
  const nbpUsd = await getNbpExchangeRate('USD', issueDate);
  const nbpCad = await getNbpExchangeRate('CAD', issueDate);

  console.log(`📈 Kurs NBP USD: 1 USD = ${nbpUsd.rate} PLN (${nbpUsd.tableNo} z dnia ${nbpUsd.tableDate})`);
  console.log(`📈 Kurs NBP CAD: 1 CAD = ${nbpCad.rate} PLN (${nbpCad.tableNo} z dnia ${nbpCad.tableDate})`);

  // 2. Definicja komponentów kompletu Gorsenia Nadine z katalogu WooCommerce + MADA XML
  const nadineComponents = [
    {
      wcId: 3874,
      sku: 'MADA-106363',
      brand: 'Gorsenia',
      modelCode: 'G 014 Nadine Soft Bra',
      customsDescription: "Women's brassiere, knitted/lace, 90% Polyamide, 7% Elastane, 3% Polyester, Brand: Gorsenia, Model: G 014 Nadine",
      materialComposition: '90% Polyamide, 7% Elastane, 3% Polyester',
      htsCode: marketConfig.customsAndHts.componentHtsMapping.bra_synthetic.htsUs, // 6212.10.9020
      countryOfOrigin: 'PL',
      qty: 1,
      unitWeightKg: 0.09,
      catalogUnitPrice: 95.99
    },
    {
      wcId: 3932,
      sku: 'MADA-106383',
      brand: 'Gorsenia',
      modelCode: 'F 014 Nadine Panties',
      customsDescription: "Women's briefs/panties, knitted, 90% Polyamide, 7% Elastane, 3% Polyester, Brand: Gorsenia, Model: F 014 Nadine",
      materialComposition: '90% Polyamide, 7% Elastane, 3% Polyester',
      htsCode: marketConfig.customsAndHts.componentHtsMapping.panty_synthetic_knit.htsUs, // 6108.22.9020
      countryOfOrigin: 'PL',
      qty: 1,
      unitWeightKg: 0.04,
      catalogUnitPrice: 46.99
    }
  ];

  // 3. Proporcjonalne rozbicie rabatu -$10.00 Set Savings
  const allocation = allocateProportionalSetDiscount(nadineComponents, 10.00);
  console.log('\n📊 Wynik proporcjonalnego rozbicia kompletu Gorsenia Nadine (-$10.00 Set Savings):');
  console.log(JSON.stringify(allocation, null, 2));

  const invoicesDir = path.resolve(path.dirname(marketConfigPath), 'invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  // 4. Wygeneruj Commercial Invoice dla USA (USD, DDP, HTS 6212.10.9020 + 6108.22.9020)
  const usCommercialHtml = buildDhlCommercialInvoiceNadineHtml({
    invoiceNo: 'EXP-DHL-NADINE-US-9101',
    issueDate,
    currency: 'USD',
    displaySymbol: 'US$',
    destCountry: 'US',
    consignee: {
      name: 'Jessica Miller',
      street: '450 Park Avenue, Apt 12B',
      city: 'New York',
      state: 'NY',
      postalCode: '10022',
      countryName: 'United States',
      phone: '+1 212 555 0148',
      email: 'jessica.miller@example.com'
    },
    incoterms: marketConfig.markets.US.incoterms, // DDP
    shippingCost: marketConfig.markets.US.standardShippingCost, // 24.99
    allocationResult: allocation,
    nbpData: nbpUsd
  });
  const usCommPath = path.join(invoicesDir, 'dryrun_commercial_invoice_nadine_us.html');
  fs.writeFileSync(usCommPath, usCommercialHtml, 'utf-8');

  // 5. Wygeneruj Commercial Invoice dla Kanady (CAD, DDP, CETA Origin Declaration 0% Duty)
  const caCommercialHtml = buildDhlCommercialInvoiceNadineHtml({
    invoiceNo: 'EXP-DHL-NADINE-CA-9102',
    issueDate,
    currency: 'CAD',
    displaySymbol: 'C$',
    destCountry: 'CA',
    consignee: {
      name: 'Chloé Dubois',
      street: '1250 René-Lévesque Blvd W',
      city: 'Montréal',
      state: 'QC',
      postalCode: 'H3B 4W8',
      countryName: 'Canada',
      phone: '+1 514 555 0182',
      email: 'chloe.dubois@example.ca'
    },
    incoterms: marketConfig.markets.CA.incoterms, // DDP
    shippingCost: marketConfig.markets.CA.standardShippingCost, // 24.99
    allocationResult: allocation,
    nbpData: nbpCad
  });
  const caCommPath = path.join(invoicesDir, 'dryrun_commercial_invoice_nadine_ca_ceta.html');
  fs.writeFileSync(caCommPath, caCommercialHtml, 'utf-8');

  // 6. Wygeneruj fakturę konsumencką B2C (poza KSeF) oraz testowy XML KSeF FA(3) dla B2B
  const mockOrderCa = {
    id: '9102-NADINE-CA',
    date_created: `${issueDate}T10:30:00`,
    currency: 'CAD',
    total: (parseFloat(allocation.netTargetTotal) + marketConfig.markets.CA.standardShippingCost).toFixed(2),
    billing: {
      first_name: 'Chloé',
      last_name: 'Dubois',
      address_1: '1250 René-Lévesque Blvd W',
      city: 'Montréal',
      state: 'QC',
      postcode: 'H3B 4W8',
      country: 'CA',
      email: 'chloe.dubois@example.ca',
      phone: '+1 514 555 0182'
    },
    shipping: {
      country: 'CA',
      state: 'QC',
      city: 'Montréal'
    },
    line_items: allocation.items.map(it => ({
      name: `${it.brand} ${it.modelCode} (Proportional Set Price)`,
      sku: it.sku,
      quantity: it.qty,
      total: it.lineNetTotal
    }))
  };

  const caClassification = classifyOrder(mockOrderCa);
  const caB2cHtml = generateB2cConsumerInvoiceHtml(mockOrderCa, nbpCad, caClassification);
  const caB2cPath = path.join(invoicesDir, 'dryrun_b2c_invoice_nadine_ca.html');
  fs.writeFileSync(caB2cPath, caB2cHtml, 'utf-8');

  // Zapis do rejestru 0% VAT (IE-599) i monitoringu GST/Nexus
  updateVat0AndNexusRegistry(mockOrderCa, nbpCad, caClassification);

  // Raport JSON z symulacji Dry-Run
  const dryRunReport = {
    timestamp: new Date().toISOString(),
    simulationName: 'Gorsenia Nadine Coordinated Set – DHL Express Commercial Invoice & CETA Dry-Run',
    exporter: EXPORTER,
    setSplittingAndDiscountAllocation: allocation,
    nbpConversion: {
      USD: {
        ...nbpUsd,
        netGoodsUsd: parseFloat(allocation.netTargetTotal),
        netGoodsPln: Number((parseFloat(allocation.netTargetTotal) * nbpUsd.rate).toFixed(2)),
        shippingUsd: marketConfig.markets.US.standardShippingCost,
        totalOrderUsd: Number((parseFloat(allocation.netTargetTotal) + marketConfig.markets.US.standardShippingCost).toFixed(2)),
        totalOrderPln: Number(((parseFloat(allocation.netTargetTotal) + marketConfig.markets.US.standardShippingCost) * nbpUsd.rate).toFixed(2))
      },
      CAD: {
        ...nbpCad,
        netGoodsCad: parseFloat(allocation.netTargetTotal),
        netGoodsPln: Number((parseFloat(allocation.netTargetTotal) * nbpCad.rate).toFixed(2)),
        shippingCad: marketConfig.markets.CA.standardShippingCost,
        totalOrderCad: Number((parseFloat(allocation.netTargetTotal) + marketConfig.markets.CA.standardShippingCost).toFixed(2)),
        totalOrderPln: Number(((parseFloat(allocation.netTargetTotal) + marketConfig.markets.CA.standardShippingCost) * nbpCad.rate).toFixed(2))
      }
    },
    cetaOriginDeclaration: {
      applicableToCanada: true,
      preferentialDutyRateCanada: '0%',
      standardTariffSaved: '18%',
      declarationText: `The exporter of the products covered by this document (Exporter Reference / EORI No. ${EXPORTER.eori}) declares that, except where otherwise clearly indicated, these products are of EU (Poland) preferential origin.`
    },
    ksefComplianceRule: {
      b2cConsumerOrders: 'EXEMPT_FROM_KSEF (Imienna faktura konsumencka B2C HTML/PDF + ujęcie w JPK_V7 ze stawką 0% VAT po otrzymaniu komunikatu IE-599 od DHL Express)',
      b2bOrdersWithNip: 'KSEF_FA3_XML_GENERATED'
    },
    generatedFiles: [
      usCommPath,
      caCommPath,
      caB2cPath
    ]
  };

  const reportOutPath = path.resolve(path.dirname(marketConfigPath), 'reports/dry_run_nadine_customs_ksef_report.json');
  fs.writeFileSync(reportOutPath, JSON.stringify(dryRunReport, null, 2), 'utf-8');
  console.log(`\n✅ Zapisano pliki Commercial Invoice (US & CA CETA) oraz raport Dry-Run: ${reportOutPath}`);
}

runDryRunSimulation().catch(console.error);
