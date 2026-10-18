import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function uploadImage(filePath, title, altText) {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const fileData = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'image/jpeg',
    'Content-Disposition': `attachment; filename="${fileName}"`
  };

  const res = await axios.post('https://naturaintimo.com/wp-json/wp/v2/media', fileData, { headers });
  console.log(`Uploaded ${fileName} -> Media ID: ${res.data.id}, URL: ${res.data.source_url}`);

  await axios.post(
    `https://naturaintimo.com/wp-json/wp/v2/media/${res.data.id}`,
    {
      title: title,
      alt_text: altText
    },
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return { id: res.data.id, url: res.data.source_url };
}

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('1. Uploading clean, policy-compliant image for Gorsenia Paradise Panties...');
  const newImg = await uploadImage(
    'temp_images/gorsenia_paradise_panties_clean_gmc.jpg',
    'Gorsenia Paradise Brazilian Panties Studio Black',
    'Gorsenia Paradise Brazilian panties Black European lace everyday comfort'
  );

  console.log('\n2. Updating Parent Product 3674 (Gorsenia Paradise Brazilian panties)...');
  
  // Clean description removing all suggestive words ('sensuality') and adding proper Panties Size Guide
  const cleanShortDesc = '<p>Embrace effortless elegance and refined craftsmanship with the Gorsenia Paradise Brazilian panties in classic black, designed to harmonize sophisticated aesthetics with everyday comfort.</p>';

  const cleanFullDesc = `<p>Embrace effortless elegance and refined craftsmanship with the Gorsenia Paradise Brazilian panties in classic black. Designed to harmonize sophisticated aesthetics with everyday comfort, these panties offer a modern cut that gracefully enhances your natural silhouette for both daily wear and special occasions.</p>
<h3>Why you’ll love it</h3>
<ul>
<li>Modern Brazilian cut tailored for an elegant, flattering fit</li>
<li>Crafted for a harmonious blend of refined style and breathable, all-day comfort</li>
<li>Sophisticated aesthetic featuring delicate floral lace and soft sheer mesh inserts</li>
<li>Designed to pair perfectly with the matching Gorsenia Paradise Soft Bra</li>
</ul>
<h3>Product details</h3>
<ul>
<li><strong>Fabric:</strong> 90% Polyamide, 7% Elastane, 3% Polyester</li>
<li><strong>Country of origin:</strong> Made in Poland (EU)</li>
<li><strong>Brand:</strong> Gorsenia</li>
<li><strong>Style:</strong> Paradise Brazilian panties</li>
<li><strong>Color:</strong> Black</li>
<li><strong>Available sizes:</strong> S–2XL</li>
<li><strong>Matching item:</strong> Gorsenia Paradise Soft Bra</li>
<li><strong>Care:</strong> Hand wash recommended or gentle machine cycle in a lingerie bag at 30°C.</li>
</ul>
<div class="naturaintimo-size-guide" style="margin-top: 2rem;padding: 1.25rem;background-color: #fdfbf7;border: 1px solid #e8e2d5;border-radius: 8px">
<h3 style="margin-top: 0;color: #1a1a1a;font-size: 1.15rem">📐 Women's Panties Size Guide (EU vs US)</h3>
<p style="font-size: 0.9rem;color: #555">Our European briefs are tailored for an accurate, comfortable fit. Use this reference chart to find your US size equivalent:</p>
<table style="width: 100%;border-collapse: collapse;margin-top: 0.75rem;font-size: 0.85rem">
<thead>
<tr style="background-color: #f4ede2;text-align: left">
<th style="padding: 8px;border: 1px solid #ddd">EU Size</th>
<th style="padding: 8px;border: 1px solid #ddd">US Panty Size</th>
<th style="padding: 8px;border: 1px solid #ddd">US Dress Equivalent</th>
<th style="padding: 8px;border: 1px solid #ddd">Hip Circumference</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding: 6px 8px;border: 1px solid #eee">S (36)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">S (5)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">US 4 – 6</td>
<td style="padding: 6px 8px;border: 1px solid #eee">35" – 37" (88 – 94 cm)</td>
</tr>
<tr style="background-color: #faf7f2">
<td style="padding: 6px 8px;border: 1px solid #eee">M (38)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">M (6)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">US 6 – 8</td>
<td style="padding: 6px 8px;border: 1px solid #eee">37" – 39" (94 – 100 cm)</td>
</tr>
<tr>
<td style="padding: 6px 8px;border: 1px solid #eee">L (40)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">L (7)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">US 8 – 10</td>
<td style="padding: 6px 8px;border: 1px solid #eee">39" – 41" (100 – 106 cm)</td>
</tr>
<tr style="background-color: #faf7f2">
<td style="padding: 6px 8px;border: 1px solid #eee">XL (42)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">XL (8)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">US 10 – 12</td>
<td style="padding: 6px 8px;border: 1px solid #eee">41" – 44" (106 – 112 cm)</td>
</tr>
<tr>
<td style="padding: 6px 8px;border: 1px solid #eee">2XL (44)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">2XL (9)</td>
<td style="padding: 6px 8px;border: 1px solid #eee">US 12 – 14</td>
<td style="padding: 6px 8px;border: 1px solid #eee">44" – 47" (112 – 120 cm)</td>
</tr>
</tbody>
</table>
</div>`;

  const parentPayload = {
    short_description: cleanShortDesc,
    description: cleanFullDesc,
    images: [
      { id: newImg.id },
      { id: 3671 } // original full back/side view as secondary
    ],
    meta_data: [
      { key: '_wc_gla_adult', value: 'no' }
    ]
  };

  const updateParentRes = await axios.put('https://naturaintimo.com/wp-json/wc/v3/products/3674', parentPayload, { headers });
  console.log(`Parent product 3674 updated successfully. Main image: ${updateParentRes.data.images[0]?.src}`);

  console.log('\n3. Updating all 5 variations of Product 3674...');
  const varsRes = await axios.get('https://naturaintimo.com/wp-json/wc/v3/products/3674/variations?per_page=100', { headers });
  const variations = varsRes.data;

  const batchPayload = {
    update: variations.map(v => ({
      id: v.id,
      image: { id: newImg.id },
      meta_data: [
        { key: '_wc_gla_adult', value: 'no' }
      ]
    }))
  };

  const batchRes = await axios.post('https://naturaintimo.com/wp-json/wc/v3/products/3674/variations/batch', batchPayload, { headers });
  console.log(`Successfully batch-updated ${batchRes.data.update.length} variations with new clean image and adult: no.`);

  console.log('\n4. Auditing and fixing other products with _wc_gla_adult = yes (Ava 3601, Gaia 3772)...');
  for (const extraId of [3601, 3772]) {
    await axios.put(`https://naturaintimo.com/wp-json/wc/v3/products/${extraId}`, {
      meta_data: [{ key: '_wc_gla_adult', value: 'no' }]
    }, { headers });
    console.log(`Product ${extraId}: set _wc_gla_adult = 'no'`);
  }

  console.log('\n5. Triggering Google Listings & Ads refresh...');
  try {
    const refreshRes = await axios.post('https://naturaintimo.com/wp-json/wc/gla/mc/product-statistics/refresh', {}, { headers });
    console.log('Statistics refresh triggered:', refreshRes.data);
  } catch (err) {
    console.log('Refresh note:', err.message);
  }

  // Purge LiteSpeed Cache so frontend displays fresh images
  await axios.post('https://naturaintimo.com/wp-json/ni/v1/purge-cache', {}, { headers });
  console.log('LiteSpeed Cache purged.');

  console.log('\n=== ALL FIXES APPLIED SUCCESSFULLY ===');
}

main().catch(console.error);
