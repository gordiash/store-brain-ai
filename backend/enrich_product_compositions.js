import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import WooCommerceRestApiPackage from '@woocommerce/woocommerce-rest-api';
const WooCommerceRestApi = WooCommerceRestApiPackage.default;

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3'
});

// Fiber dictionary translation from Polish to FTC-compliant English
const fiberMap = {
  'poliamid': 'Polyamide',
  'elastan': 'Elastane',
  'poliester': 'Polyester',
  'bawełna': 'Cotton',
  'poliuretan': 'Polyurethane',
  'inne': 'Other Fibers',
  'wiskoza': 'Viscose',
  'akryl': 'Acrylic',
  'wełna': 'Wool',
  'jedwab': 'Silk'
};

function translateComposition(rawPl) {
  if (!rawPl) return null;
  // Examples: "57% poliamid, 18% bawełna, 10% elastan, 10% poliester, 5% poliuretan"
  const clean = rawPl.replace(/&nbsp;/g, ' ').trim();
  const parts = clean.split(/[,;]/);
  const translated = [];

  for (const part of parts) {
    const trimmed = part.trim();
    const match = trimmed.match(/^(\d+)\s*%\s*(.*)$/);
    if (match) {
      const pct = match[1];
      const fiberPl = match[2].trim().toLowerCase();
      const fiberEn = fiberMap[fiberPl] || fiberPl.charAt(0).toUpperCase() + fiberPl.slice(1);
      translated.push(`${pct}% ${fiberEn}`);
    } else {
      // Check inverted format e.g. "poliamid 84%"
      const matchInv = trimmed.match(/^(.*?)\s*(\d+)\s*%$/);
      if (matchInv) {
        const fiberPl = matchInv[1].trim().toLowerCase();
        const pct = matchInv[2];
        const fiberEn = fiberMap[fiberPl] || fiberPl.charAt(0).toUpperCase() + fiberPl.slice(1);
        translated.push(`${pct}% ${fiberEn}`);
      } else {
        translated.push(trimmed);
      }
    }
  }

  return translated.join(', ');
}

async function run() {
  console.log('1. Reading products.xml...');
  const xmlContent = fs.readFileSync('c:\\Users\\jaros\\Desktop\\TikTok Agent\\backend\\products.xml', 'utf8');
  const regex = /<ID>(\d+)<\/ID>[\s\S]*?<DESC><!\[CDATA\[([\s\S]*?)\]\]><\/DESC>/g;
  let match;
  const madaCompositions = new Map();
  while ((match = regex.exec(xmlContent)) !== null) {
    const id = match[1];
    const desc = match[2];
    const m = desc.match(/Skład:?\s*([^\n\r<]+)/i);
    if (m) {
      madaCompositions.set(id, m[1].replace(/&nbsp;/g, ' ').trim());
    }
  }
  // Hardcoded match from collection bra 106363 for panties 106383
  madaCompositions.set('106383', '90% poliamid, 7% elastan, 3% poliester');
  console.log(`Loaded ${madaCompositions.size} compositions from MADA XML.`);

  console.log('2. Fetching all products from WooCommerce...');
  const res = await api.get('products?per_page=100');
  const products = res.data;
  console.log(`Found ${products.length} products to process.`);

  let updatedCount = 0;

  for (const product of products) {
    const mIdMeta = product.meta_data.find(m => m.key === 'mada_product_id');
    const mId = mIdMeta ? mIdMeta.value : null;

    if (!mId || !madaCompositions.has(mId)) {
      console.warn(`[SKIP] Product ID ${product.id} (${product.name}) has no MADA composition.`);
      continue;
    }

    const rawPl = madaCompositions.get(mId);
    const compEn = translateComposition(rawPl);
    const originEn = 'Made in Poland (EU)';

    // Update product meta_data
    const metaData = [...product.meta_data];
    const updateMeta = (key, val) => {
      const existing = metaData.find(m => m.key === key);
      if (existing) {
        existing.value = val;
      } else {
        metaData.push({ key, value: val });
      }
    };

    updateMeta('_material_composition', compEn);
    updateMeta('_country_of_origin', 'PL');

    // Update product description HTML
    let desc = product.description || '';
    
    // Check if composition already exists in description
    if (desc.includes('<strong>Material composition:</strong>') || desc.includes('<strong>Fabric:</strong>')) {
      // Replace existing
      desc = desc.replace(
        /<li><strong>(Material composition|Fabric):<\/strong>.*?<\/li>/i,
        `<li><strong>Fabric:</strong> ${compEn}</li>`
      );
    } else if (desc.includes('<h3>Product details</h3>') && desc.includes('<ul>')) {
      // Insert inside Product details <ul>
      desc = desc.replace(
        '<h3>Product details</h3>\n<ul>',
        `<h3>Product details</h3>\n<ul>\n<li><strong>Fabric:</strong> ${compEn}</li>\n<li><strong>Country of origin:</strong> ${originEn}</li>`
      );
    } else {
      // Append at the bottom
      desc += `\n<div class="ni-fabric-details" style="margin-top:16px;"><strong>Fabric:</strong> ${compEn} | <strong>Origin:</strong> ${originEn}</div>`;
    }

    try {
      await api.put(`products/${product.id}`, {
        description: desc,
        meta_data: metaData
      });
      console.log(`[OK] Product ${product.id} (${product.name}) -> ${compEn}`);
      updatedCount++;
    } catch (err) {
      console.error(`[ERROR] Product ${product.id} update failed:`, err.response ? err.response.data : err.message);
    }
  }

  console.log(`\nCOMPLETED: Updated ${updatedCount} of ${products.length} products with material composition and origin.`);
}

run().catch(console.error);
