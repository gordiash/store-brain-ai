import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import https from 'https';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('--- 1. Reordering Menu 40 ---');

  // Logical and standard e-commerce menu order:
  // 1. Shop
  // 2. Full Bust Bras (DD+)
  // 3. Size Guide
  // 4. About Natura Intimo
  // 5. Track Order
  // 6. Account
  // 7. 🇺🇸 USA
  // 8. 🇨🇦 Canada

  const updates = [
    { id: 132, order: 1, title: 'Shop' },
    { id: 6932, order: 2, title: 'Full Bust Bras (DD+)' },
    { id: 4574, order: 4, title: 'About Natura Intimo' },
    { id: 6930, order: 5, title: 'Track Order' },
    { id: 4573, order: 6, title: 'Account' },
    { id: 4576, order: 7, title: '🇺🇸 USA' },
    { id: 4577, order: 8, title: '🇨🇦 Canada' }
  ];

  for (const u of updates) {
    const res = await axios.put(`https://naturaintimo.com/wp-json/wp/v2/menu-items/${u.id}`, {
      menu_order: u.order
    }, { headers });
    console.log(`Updated item ${u.id} (${u.title}) to order ${u.order}: status ${res.status}`);
  }

  // Check if Size Guide is already in menu
  const menuRes = await axios.get('https://naturaintimo.com/wp-json/wp/v2/menu-items?menus=40&per_page=50', { headers });
  const hasSizeGuide = menuRes.data.some(i => i.title?.rendered?.toLowerCase().includes('size guide') || i.url?.includes('/size-guide/'));
  
  if (!hasSizeGuide) {
    console.log('Adding "Size Guide" to Menu 40 at order 3...');
    const createRes = await axios.post('https://naturaintimo.com/wp-json/wp/v2/menu-items', {
      title: 'Size Guide',
      url: 'https://naturaintimo.com/size-guide/',
      menus: 40,
      menu_order: 3,
      status: 'publish'
    }, { headers });
    console.log('Added Size Guide item ID:', createRes.data.id);
  }

  // Fetch final menu state
  const finalMenu = await axios.get('https://naturaintimo.com/wp-json/wp/v2/menu-items?menus=40&per_page=50', { headers });
  const sorted = finalMenu.data.sort((a,b) => a.menu_order - b.menu_order);
  console.log('\n--- Final Menu 40 Order ---');
  sorted.forEach(i => {
    console.log(`Order ${i.menu_order}: "${i.title?.rendered}" -> ${i.url}`);
  });

  // Verify on live page HTML
  console.log('\n--- Verifying Live Site Header Menu ---');
  https.get('https://naturaintimo.com/?t=' + Date.now(), res => {
    let b = '';
    res.on('data', c => b += c);
    res.on('end', () => {
      const menuStart = b.indexOf('id="ast-hf-menu-1"');
      if (menuStart !== -1) {
        const menuSlice = b.substring(menuStart, menuStart + 2000);
        const matches = [...menuSlice.matchAll(/<a[^>]+class="menu-link"[^>]*>([\s\S]*?)<\/a>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
        console.log('Live header menu items rendered:\n', matches);
      } else {
        console.log('Menu container id not found directly, checking ast-desktop-header-content');
      }
    });
  });
}

main().catch(console.error);
