import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import fs from 'fs';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('=== STEP 1: Updating Featured Images & Slugs for Flagged Products ===');

  const flaggedUpdates = [
    {
      id: 3507,
      name: 'Gorsenia Luisse Soft Bra Black 65F-110D',
      slug: 'bra-soft-gorsenia-k-441-1-luisse-black',
      primaryImageId: 6938, // Clean cropped studio bust shot
      allImageIds: [6938, 3504, 3503, 3505, 3506]
    },
    {
      id: 3570,
      name: 'Gorsenia Luisse bikini briefs black M–2XL',
      slug: 'panties-gorsenia-k-442-1-luisse-black',
      primaryImageId: 3569, // Clean focused panty close-up (359342.jpg)
      allImageIds: [3569, 3568, 3567]
    },
    {
      id: 3674,
      name: 'Gorsenia Paradise Brazilian panties Black M-2XL',
      slug: 'panties-gorsenia-k-498-paradise-brazilian-briefs',
      primaryImageId: 6939, // Clean studio lace panty shot
      allImageIds: [6939, 3672, 3671, 3673]
    },
    {
      id: 3874,
      name: 'Gorsenia Nadine Soft Bra Multicolor 65F-115D',
      slug: 'bra-soft-gorsenia-g-014-nadine',
      primaryImageId: 3872, // Clean studio bust shot on white background (414787.jpg)
      allImageIds: [3872, 3871, 3873, 3870]
    },
    {
      id: 3579,
      name: 'Ava Soft Bra 2271 Divine Champagne Wine 65I-95B',
      slug: 'bra-soft-ava-2271-divine-champagne-wine',
      primaryImageId: 3576, // Clean studio bust shot on white background (430845.jpg)
      allImageIds: [3576, 3577, 3578, 3600]
    },
    {
      id: 3601,
      name: 'Ava 2271 Divine bikini briefs champagne wine S',
      slug: 'panties-ava-2271-divine-champagne-wine-s-3xl',
      primaryImageId: 3598, // Clean focused panty close-up (428761.jpg)
      allImageIds: [3598, 3599, 3600]
    }
  ];

  for (const item of flaggedUpdates) {
    console.log(`Updating Parent Product ${item.id} (${item.name})...`);
    const payload = {
      slug: item.slug,
      images: item.allImageIds.map(id => ({ id }))
    };

    const res = await axios.put(`https://naturaintimo.com/wp-json/wc/v3/products/${item.id}`, payload, { headers });
    console.log(`  -> Status 200. New slug: ${res.data.slug}, Main image: ${res.data.images[0]?.src}`);

    // Now update ALL variations of this product
    console.log(`  Fetching variations for ${item.id}...`);
    let vars = [];
    let page = 1;
    while (true) {
      const vRes = await axios.get(`https://naturaintimo.com/wp-json/wc/v3/products/${item.id}/variations?per_page=100&page=${page}`, { headers });
      if (!vRes.data || vRes.data.length === 0) break;
      vars = vars.concat(vRes.data);
      page++;
    }
    console.log(`  Found ${vars.length} variations. Updating their image to ID ${item.primaryImageId}...`);

    // Batch update variations
    const batchPayload = {
      update: vars.map(v => ({
        id: v.id,
        image: { id: item.primaryImageId }
      }))
    };

    const batchRes = await axios.post(`https://naturaintimo.com/wp-json/wc/v3/products/${item.id}/variations/batch`, batchPayload, { headers });
    console.log(`  -> Successfully batch updated ${batchRes.data.update.length} variations.`);
  }

  console.log('\n=== STEP 2: Updating Polish Slugs on Remaining Products ===');
  const otherSlugsToFix = [
    { id: 3474, slug: 'panties-gaia-gfp-1372-mary-burgundy' },
    { id: 3442, slug: 'bra-semi-soft-gaia-bs-1372-mary-burgundy' },
    { id: 3810, slug: 'panties-gaia-gfp-1228-isla-white' },
    { id: 3777, slug: 'bra-semi-soft-gaia-bs-1228-isla-white' },
    { id: 3772, slug: 'panties-gaia-gfp-1273-aina-navy-pink' },
    { id: 3762, slug: 'bra-semi-soft-gaia-bs-1273-aina-navy-pink' },
    { id: 2471, slug: 'panties-mefemi-petra-brazilian-briefs' },
    { id: 2198, slug: 'panties-gaia-gfp-1134-keto-white' },
    { id: 2154, slug: 'bra-semi-soft-gaia-bs-1134-keto-white' },
    { id: 1253, slug: 'panties-gaia-ariarosa-gfp-005-charlotte-beige' },
    { id: 1193, slug: 'bra-soft-gaia-ariarosa-bs-005-charlotte-beige' },
    { id: 808, slug: 'panties-ava-2110-b-brazilian-briefs' },
    { id: 1517, slug: 'panties-gorsenia-k-649-alicante-brazilian-briefs' }
  ];

  for (const s of otherSlugsToFix) {
    try {
      const res = await axios.put(`https://naturaintimo.com/wp-json/wc/v3/products/${s.id}`, { slug: s.slug }, { headers });
      console.log(`Updated Product ${s.id} -> slug: ${res.data.slug} (${res.data.name})`);
    } catch (e) {
      console.error(`Error updating slug for ${s.id}:`, e.message);
    }
  }

  console.log('\n=== STEP 3: Updating Internal Landing Page Links & Carousel ===');
  // Update Full-Bust Landing Page (4133)
  const fullBustRes = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages/4133', { headers });
  let content = fullBustRes.data.content.rendered;
  
  // Replace /produkt/ with /product/
  content = content.replace(/\/produkt\//g, '/product/');
  // Replace old Luisse slug with new
  content = content.replace(/bra-soft-gorsenia-k-441-1-luisse-2/g, 'bra-soft-gorsenia-k-441-1-luisse-black');
  // Replace old Nadine model image with clean bust image
  content = content.replace(/https:\/\/naturaintimo\.com\/wp-content\/uploads\/2026\/09\/414790\.jpg/g, 'https://naturaintimo.com/wp-content/uploads/2026/09/414787.jpg');
  // Replace old Luisse model image with clean cropped bust image
  content = content.replace(/https:\/\/naturaintimo\.com\/wp-content\/uploads\/2026\/09\/359337\.jpg/g, 'https://naturaintimo.com/wp-content/uploads/2026/10/luisse_bra_cropped.jpg');

  await axios.post('https://naturaintimo.com/wp-json/wp/v2/pages/4133', { content: content }, { headers });
  console.log('Updated Full-Bust Landing Page (4133) with clean /product/ URLs and compliant images.');

  console.log('\n=== ALL FEED FIXES COMPLETED SUCCESSFULLY ===');
}

main().catch(console.error);
