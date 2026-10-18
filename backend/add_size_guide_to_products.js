// backend/add_size_guide_to_products.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const TRACKER_FILE = path.join(process.cwd(), 'google_merchant_tracker.json');

const BRA_SIZE_GUIDE_HTML = `
<div class="naturaintimo-size-guide" style="margin-top: 2rem; padding: 1.25rem; background-color: #fdfbf7; border: 1px solid #e8e2d5; border-radius: 8px;">
  <h3 style="margin-top: 0; color: #1a1a1a; font-size: 1.15rem;">📐 European vs US/UK Bra Size Guide</h3>
  <p style="font-size: 0.9rem; color: #555;">All Natura Intimo bras are designed according to premium European sizing standards. Use this quick reference table to find your perfect US size equivalent:</p>
  
  <table style="width: 100%; border-collapse: collapse; margin-top: 0.75rem; font-size: 0.85rem;">
    <thead>
      <tr style="background-color: #f4ede2; text-align: left;">
        <th style="padding: 8px; border: 1px solid #ddd;">EU Band Size</th>
        <th style="padding: 8px; border: 1px solid #ddd;">US / UK Band Equivalent</th>
        <th style="padding: 8px; border: 1px solid #ddd;">EU Cup</th>
        <th style="padding: 8px; border: 1px solid #ddd;">US Cup Equivalent</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding: 6px 8px; border: 1px solid #eee;">65</td><td style="padding: 6px 8px; border: 1px solid #eee;">30</td><td style="padding: 6px 8px; border: 1px solid #eee;">B, C, D</td><td style="padding: 6px 8px; border: 1px solid #eee;">B, C, D</td></tr>
      <tr style="background-color: #faf7f2;"><td style="padding: 6px 8px; border: 1px solid #eee;">70</td><td style="padding: 6px 8px; border: 1px solid #eee;">32</td><td style="padding: 6px 8px; border: 1px solid #eee;">E, F</td><td style="padding: 6px 8px; border: 1px solid #eee;">DD, DDD / F</td></tr>
      <tr><td style="padding: 6px 8px; border: 1px solid #eee;">75</td><td style="padding: 6px 8px; border: 1px solid #eee;">34</td><td style="padding: 6px 8px; border: 1px solid #eee;">G, H</td><td style="padding: 6px 8px; border: 1px solid #eee;">G, H</td></tr>
      <tr style="background-color: #faf7f2;"><td style="padding: 6px 8px; border: 1px solid #eee;">80</td><td style="padding: 6px 8px; border: 1px solid #eee;">36</td><td style="padding: 6px 8px; border: 1px solid #eee;">I, J, K</td><td style="padding: 6px 8px; border: 1px solid #eee;">I, J, K</td></tr>
      <tr><td style="padding: 6px 8px; border: 1px solid #eee;">85 – 105</td><td style="padding: 6px 8px; border: 1px solid #eee;">38 – 46</td><td style="padding: 6px 8px; border: 1px solid #eee;">Full Bust Range</td><td style="padding: 6px 8px; border: 1px solid #eee;">Plus Size Equivalent</td></tr>
    </tbody>
  </table>
  
  <p style="font-size: 0.8rem; color: #777; margin-bottom: 0; margin-top: 0.75rem;">💡 <em>Tip: If you are between band sizes, European bands provide firm, supportive elasticity. We recommend selecting your usual US band size converted to EU centimeters (e.g., US 34 ➔ EU 75).</em></p>
</div>
`;

async function addSizeGuideToBras() {
  const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!fs.existsSync(TRACKER_FILE)) return;
  const tracker = JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf-8'));
  const productIds = tracker.processedIds || [];

  console.log("=================================================");
  console.log(`🚀 WDROŻENIE TABELI ROZMIARÓW EU VS US NA KARTACH BIUSTONOSZY 🚀`);
  console.log("=================================================\n");

  let updatedCount = 0;

  for (const id of productIds) {
    try {
      const getUrl = `https://naturaintimo.com/wp-json/wc/v3/products/${id}`;
      const res = await fetch(getUrl);
      if (!res.ok) continue;

      const p = await res.json();
      const name = (p.name || "").toLowerCase();
      const isBra = name.includes('bra') || name.includes('biustonosz') || p.categories?.some(c => c.id === 48 || c.id === 53 || c.id === 54 || c.id === 55);

      if (isBra && p.description && !p.description.includes('naturaintimo-size-guide')) {
        const updatedDesc = p.description + "\n" + BRA_SIZE_GUIDE_HTML;
        const putUrl = `https://naturaintimo.com/wp-json/wc/v3/products/${id}`;
        
        const putRes = await fetch(putUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: updatedDesc })
        });

        if (putRes.ok) {
          updatedCount++;
          console.log(`✅ [SIZE GUIDE] Dodano tabelę konwersji EU/US dla Bra ID ${id} ("${p.name}")`);
        }
      }
    } catch (err) {
      console.error(`❌ Błąd dodawania Size Guide dla ID ${id}:`, err.message);
    }
  }

  console.log("\n=================================================");
  console.log(`🎉 ZAKOŃCZONO WDROŻENIE SIZE GUIDE (FILAR II):`);
  console.log(`✅ Dodano tabelę konwersji EU vs US dla ${updatedCount} biustonoszy.`);
  console.log("=================================================");
}

addSizeGuideToBras();
