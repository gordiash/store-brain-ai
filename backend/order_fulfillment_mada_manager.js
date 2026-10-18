import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

if (!ck || !cs) {
  throw new Error('Brak wymaganych poświadczeń WooCommerce (WOOCOMMERCE_CONSUMER_KEY / WOOCOMMERCE_CONSUMER_SECRET w .env)');
}

const authHeader = 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');
const headers = { Authorization: authHeader };

// 1. Wczytanie konfiguracji rynków (Single Source of Truth)
const marketConfigPath = path.resolve('backend/market_config.json');
let marketConfig = {};
if (fs.existsSync(marketConfigPath)) {
  marketConfig = JSON.parse(fs.readFileSync(marketConfigPath, 'utf-8'));
} else {
  // Fallback gdyby plik był uruchamiany z innego katalogu
  marketConfig = JSON.parse(fs.readFileSync(path.resolve('market_config.json'), 'utf-8'));
}

// 2. Indeksowanie bazy hurtowni MADA z products.xml
export function parseMadaXml(xmlFilePath = 'backend/products.xml') {
  if (!fs.existsSync(xmlFilePath)) {
    if (fs.existsSync('products.xml')) {
      xmlFilePath = 'products.xml';
    } else {
      throw new Error(`Plik ${xmlFilePath} nie istnieje!`);
    }
  }

  console.log(`Wczytywanie i parsowanie bazy hurtowni MADA (${xmlFilePath})...`);
  const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');

  const productsMap = new Map(); // mada_id -> product details
  const eanMap = new Map(); // ean -> variation details

  const productRegex = /<PRODUCT>([\s\S]*?)<\/PRODUCT>/g;
  let match;

  while ((match = productRegex.exec(xmlContent)) !== null) {
    const pXml = match[1];
    const idMatch = pXml.match(/<ID>(\d+)<\/ID>/);
    if (!idMatch) continue;
    const madaId = idMatch[1];

    const codeMatch = pXml.match(/<CODE><!\[CDATA\[(.*?)\]\]><\/CODE>/) || pXml.match(/<CODE>(.*?)<\/CODE>/);
    const code = codeMatch ? codeMatch[1].trim() : '';

    const nameMatch = pXml.match(/<NAME><!\[CDATA\[(.*?)\]\]><\/NAME>/) || pXml.match(/<NAME>(.*?)<\/NAME>/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    const producerMatch = pXml.match(/<PRODUCER><!\[CDATA\[(.*?)\]\]><\/PRODUCER>/) || pXml.match(/<PRODUCER>(.*?)<\/PRODUCER>/);
    const producer = producerMatch ? producerMatch[1].trim() : '';

    const priceMatch = pXml.match(/<PRICE>([\d.]+)<\/PRICE>/);
    const wholesalePricePln = priceMatch ? parseFloat(priceMatch[1]) : 0;

    const modelsMatch = pXml.match(/<MODELS>([\s\S]*?)<\/MODELS>/);
    const variations = [];
    let totalStock = 0;

    if (modelsMatch) {
      const modelRegex = /<MODEL>([\s\S]*?)<\/MODEL>/g;
      let mMatch;
      while ((mMatch = modelRegex.exec(modelsMatch[1])) !== null) {
        const mContent = mMatch[1];
        const colorMatch = mContent.match(/<COLOR><!\[CDATA\[(.*?)\]\]><\/COLOR>/) || mContent.match(/<COLOR>(.*?)<\/COLOR>/);
        const color = colorMatch ? colorMatch[1].trim() : '';

        const sizeRegex = /<SIZE\s+amount="(\d+)"(?:\s+ean="([^"]*)")?(?:\s+pattern="([^"]*)")?(?:\s+pattern_img_id="([^"]*)")?>([^<]*)<\/SIZE>/g;
        let sMatch;
        while ((sMatch = sizeRegex.exec(mContent)) !== null) {
          const amount = parseInt(sMatch[1], 10);
          const ean = sMatch[2] ? sMatch[2].trim() : '';
          const size = sMatch[5] ? sMatch[5].trim() : '';
          totalStock += amount;

          const varObj = {
            madaId,
            code,
            producer,
            name,
            color,
            size,
            amount,
            ean,
            wholesalePricePln
          };
          variations.push(varObj);
          if (ean) {
            eanMap.set(ean, varObj);
          }
        }
      }
    }

    productsMap.set(madaId, {
      madaId,
      code,
      name,
      producer,
      wholesalePricePln,
      totalStock,
      variations
    });
  }

  console.log(`Zindeksowano ${productsMap.size} produktów oraz ${eanMap.size} wariantów EAN z MADA.`);
  return { productsMap, eanMap };
}

// 3. Generator Szablonów Powiadomień E-mail (Order Confirmed, Packing, Shipped, FTC Delay Notice)
export function generateNotificationTemplates(order, countryCode = 'US') {
  const isUS = countryCode === 'US';
  const isCA = countryCode === 'CA';
  const isPL = countryCode === 'PL';

  const orderNum = order.id || 'ORDER_NUM';
  const customerName = `${order.billing?.first_name || 'Valued'} ${order.billing?.last_name || 'Customer'}`.trim();
  const currency = order.currency || (isPL ? 'PLN' : (isCA ? 'CAD' : 'USD'));
  const total = order.total || '0.00';
  const carrier = isPL ? 'InPost Paczkomat / Kurier DPD' : 'DHL Express Worldwide (Air Courier)';
  const returnDays = (isUS || isCA) ? 30 : 14;

  const itemsList = (order.line_items || []).map(item => `• ${item.name} (Qty: ${item.quantity}) — ${currency} ${item.total}`).join('\n');

  // A. Szablon 1: Order Confirmed
  const orderConfirmed = {
    subject: isPL 
      ? `Potwierdzenie zamówienia #${orderNum} w Natura Intimo`
      : `Order Confirmed #${orderNum} – Natura Intimo European Luxury Lingerie`,
    body: isPL
      ? `Cześć ${customerName},\n\nDziękujemy za złożenie zamówienia #${orderNum} w sklepie Natura Intimo!\n\nZamówione produkty:\n${itemsList}\n\nSuma: ${total} ${currency}\nPrzewoźnik: ${carrier}\n\nTwoje zamówienie trafiło do realizacji. Przygotujemy je i sprawdzimy jakość przed nadaniem w ciągu 24–48 godzin roboczych.\n\nPozdrawiamy,\nZespół Natura Intimo\nsupport@naturaintimo.com`
      : `Dear ${customerName},\n\nThank you for choosing Natura Intimo! We are delighted to confirm your order #${orderNum}.\n\nOrder Summary:\n${itemsList}\n\nTotal: ${currency} $${total}\nShipping Method: ${carrier}\nDuties & Customs: Delivered Duty Paid (DDP) — 100% Guaranteed No Surprise Fees at Delivery.\nReturn Window: ${returnDays} Days from delivery (Free First Size Exchange on Coordinated Sets).\n\nYour luxury European lingerie is now entering our fulfillment queue. You will receive an update once our certified bra fitter performs the pre-shipment quality inspection.\n\nWarm regards,\nNatura Intimo Care Team\nsupport@naturaintimo.com`
  };

  // B. Szablon 2: Quality Check & Packing
  const qualityPacking = {
    subject: isPL
      ? `Twoje zamówienie #${orderNum} przechodzi kontrolę jakości – Natura Intimo`
      : `Order #${orderNum} Update: Quality Inspection & Discreet Packing – Natura Intimo`,
    body: isPL
      ? `Cześć ${customerName},\n\nTwoje zamówienie #${orderNum} zostało skompletowane i przechodzi właśnie precyzyjną kontrolę jakości (weryfikacja haftów, fiszbin i zapięć) oraz jest pakowane w eleganckie, dyskretne opakowanie.\n\nWkrótce przekażemy przesyłkę kurierowi.\n\nPozdrawiamy,\nNatura Intimo`
      : `Dear ${customerName},\n\nGreat news! Your pieces for order #${orderNum} are now at our packing atelier. Every garment is carefully hand-inspected for pristine stitching, underwire stability, and perfect fabrication before being placed into our discreet luxury packaging.\n\nYour DHL Express tracking details will follow in the next dispatch notification.\n\nWarm regards,\nNatura Intimo Care Team`
  };

  // C. Szablon 3: Shipped via DHL Express ODD
  const shippedDhl = {
    subject: isPL
      ? `Twoje zamówienie #${orderNum} zostało wysłane!`
      : `Shipped! Your Natura Intimo Order #${orderNum} is on its way via DHL Express`,
    body: isPL
      ? `Cześć ${customerName},\n\nTwoje zamówienie #${orderNum} zostało nadane!\nMożesz śledzić swoją przesyłkę pod adresem: https://www.dhl.com/pl-pl/home/tracking.html?tracking-id=TRACKING_AWB\n\nŻyczymy idealnego dopasowania i zapraszamy ponownie!\nNatura Intimo`
      : `Dear ${customerName},\n\nYour Natura Intimo order #${orderNum} has been dispatched via DHL Express Worldwide!\n\nTracking Number (AWB): TRACKING_AWB\nDirect Tracking & On Demand Delivery (ODD): https://ondemand.dhl.com/\nEstimated Delivery: 2–4 business days across ${isCA ? 'Canada' : 'the United States'}.\n\nWith DHL On Demand Delivery, you can easily customize delivery time, authorize drop-off without signature, or redirect to a nearby DHL Service Point.\n\nEnjoy your European lingerie! Our 30-day Free First Size Exchange is here if you need any adjustments.\n\nWarm regards,\nNatura Intimo Care Team`
  };

  // D. Szablon 4: FTC Mail Order Rule Delay Notice (obowiązkowy alert prawny FTC przy opóźnieniu >48h)
  const ftcDelayNotice = {
    subject: `Notice of Shipment Delay & Your Rights (Order #${orderNum}) – Natura Intimo`,
    body: `Dear ${customerName},\n\nWe are writing to provide an important update regarding your Natura Intimo order #${orderNum}.\n\nIn accordance with the U.S. Federal Trade Commission (FTC) Mail, Internet, or Telephone Order Merchandise Rule, we want to inform you that the shipment of your order is experiencing an unforeseen delay due to additional artisanal fabric verification at our European warehouse.\n\n• Original Estimated Dispatch: Within 48 hours\n• Revised Estimated Dispatch Date: REVISED_DATE\n• Shipping Method: DHL Express Worldwide (Air Priority)\n\nYOUR RIGHTS UNDER FTC REGULATIONS:\n1. You may choose to agree to this delay and keep your order active. No action is required on your part if you wish to receive your items on the revised timeline.\n2. If you prefer NOT to wait, you have the absolute right to cancel your order immediately for a 100% full refund to your original payment method.\n\nTo cancel your order immediately, simply reply to this email with "CANCEL" or contact us at support@naturaintimo.com with your order number #${orderNum}. We will process your complete refund within 1 business day.\n\nWe sincerely apologize for this unexpected delay and appreciate your understanding.\n\nWarm regards,\nNatura Intimo Store Operations\nsupport@naturaintimo.com`
  };

  return {
    orderConfirmed,
    qualityPacking,
    shippedDhl,
    ftcDelayNotice
  };
}

// 4. Główny silnik weryfikacji i realizacji zamówień
export async function runOrderFulfillmentAudit() {
  console.log('--- Rozpoczynam audyt i proces realizacji zamówień MADA ---');

  // Wczytaj bazę MADA
  const { productsMap, eanMap } = parseMadaXml();

  // Pobierz ostatnie zamówienia z WooCommerce
  console.log('Pobieram ostatnie zamówienia z WooCommerce (GET /wp-json/wc/v3/orders)...');
  const res = await fetch(`${url}/wp-json/wc/v3/orders?per_page=20`, { headers });
  if (!res.ok) {
    throw new Error(`Błąd pobierania zamówień z WooCommerce: HTTP ${res.status}`);
  }
  const orders = await res.json();
  console.log(`Pobrano ${orders.length} zamówień ze sklepu.`);

  // Przygotowanie katalogu na raporty
  const reportsDir = path.resolve('backend/reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fulfillmentReport = {
    timestamp: new Date().toISOString(),
    totalOrdersEvaluated: orders.length,
    orders: []
  };

  for (const order of orders) {
    const country = order.shipping?.country || order.billing?.country || 'US';
    const isDomestic = country === 'PL';
    const itemsReport = [];
    let orderStockStatus = 'ALL_IN_STOCK'; // ALL_IN_STOCK | PARTIAL_STOCK | OUT_OF_STOCK

    for (const item of order.line_items) {
      const sku = item.sku || '';
      let madaMatch = null;

      // 1. Dopasowanie po EAN
      if (item.meta_data) {
        const eanMeta = item.meta_data.find(m => m.key === '_ean' || m.key === 'ean' || m.key === '_gtin');
        if (eanMeta && eanMeta.value && eanMap.has(eanMeta.value)) {
          madaMatch = eanMap.get(eanMeta.value);
        }
      }

      // 2. Dopasowanie po SKU (np. MADA-ID-COLOR-SIZE)
      if (!madaMatch && sku) {
        const skuMadaId = sku.replace(/^MADA-/i, '').split('-')[0];
        if (productsMap.has(skuMadaId)) {
          const prod = productsMap.get(skuMadaId);
          madaMatch = prod.variations[0] || prod;
        }
      }

      // 3. Fallback: wyszukanie po nazwie producenta i modelu
      if (!madaMatch) {
        for (const [mId, prod] of productsMap.entries()) {
          if (prod.code && item.name.toLowerCase().includes(prod.code.toLowerCase())) {
            madaMatch = prod.variations[0] || prod;
            break;
          }
        }
      }

      const requestedQty = item.quantity;
      let stockAvailable = 0;
      let wholesalePrice = 0;
      let producerCode = '';
      let producer = '';

      if (madaMatch) {
        stockAvailable = madaMatch.amount !== undefined ? madaMatch.amount : (madaMatch.totalStock || 0);
        wholesalePrice = madaMatch.wholesalePricePln || 0;
        producerCode = madaMatch.code || '';
        producer = madaMatch.producer || '';
      }

      let itemStatus = 'AVAILABLE';
      if (!madaMatch) {
        itemStatus = 'MANUAL_LOOKUP_REQUIRED';
      } else if (stockAvailable === 0) {
        itemStatus = 'OUT_OF_STOCK_IN_MADA';
        orderStockStatus = 'OUT_OF_STOCK';
      } else if (stockAvailable < requestedQty) {
        itemStatus = 'PARTIAL_STOCK_IN_MADA';
        if (orderStockStatus !== 'OUT_OF_STOCK') orderStockStatus = 'PARTIAL_STOCK';
      }

      itemsReport.push({
        lineItemId: item.id,
        productName: item.name,
        productId: item.product_id,
        variationId: item.variation_id,
        sku: item.sku,
        requestedQty,
        madaMatch: madaMatch ? {
          madaId: madaMatch.madaId,
          producer,
          producerCode,
          color: madaMatch.color || 'Standard',
          size: madaMatch.size || 'Standard',
          stockInMada: stockAvailable,
          wholesalePricePln: wholesalePrice
        } : null,
        fulfillmentStatus: itemStatus
      });
    }

    const emailTemplates = generateNotificationTemplates(order, country);

    fulfillmentReport.orders.push({
      orderId: order.id,
      orderStatus: order.status,
      dateCreated: order.date_created,
      destinationCountry: country,
      currency: order.currency,
      totalAmount: order.total,
      customerName: `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim(),
      customerEmail: order.billing?.email,
      overallStockStatus: orderStockStatus,
      items: itemsReport,
      recommendedNextActions: {
        wholesalerAction: orderStockStatus === 'ALL_IN_STOCK' ? 'ORDER_IN_MADA' : 'CHECK_BACKORDER_OR_ALTERNATIVE',
        accountingAction: isDomestic ? 'ISSUE_B2C_OR_B2B_KSEF_PL' : 'GENERATE_COMMERCIAL_INVOICE_DHL_DDP',
        shippingCarrier: isDomestic ? 'DPD_OR_INPOST' : 'DHL_EXPRESS_WORLDWIDE'
      },
      readyEmailTemplates: emailTemplates
    });
  }

  // Zapis raportu
  const reportFilePath = path.join(reportsDir, 'order_fulfillment_report.json');
  fs.writeFileSync(reportFilePath, JSON.stringify(fulfillmentReport, null, 2), 'utf-8');
  console.log(`Raport z realizacji zamówień został zapisany do: ${reportFilePath}`);
  console.log(`Podsumowanie: Przeanalizowano ${fulfillmentReport.orders.length} zamówień. Gotowe szablony FTC i powiadomień wygenerowane.`);

  return fulfillmentReport;
}

// Uruchomienie bezpośrednie ze skryptu
if (process.argv[1] && process.argv[1].endsWith('order_fulfillment_mada_manager.js')) {
  runOrderFulfillmentAudit().catch(err => {
    console.error('Błąd podczas realizacji zamówień:', err);
    process.exit(1);
  });
}
