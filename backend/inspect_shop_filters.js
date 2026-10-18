import dotenv from 'dotenv';
dotenv.config();

const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function inspectShop() {
  const res = await fetch(url + '/new-arrivals/');
  const html = await res.text();

  const pPos = html.indexOf('<li class="desktop-align-left');
  if (pPos !== -1) {
    const end = html.indexOf('</li>', pPos);
    console.log('\n--- Sample Product Item ---');
    console.log(html.substring(pPos, end !== -1 ? end + 5 : pPos + 1500));
  }

  // Find all widget blocks
  const widgets = html.match(/<section[^>]*class="[^"]*widget[^"]*"[\s\S]*?<\/section>/g) || 
                  html.match(/<div[^>]*class="[^"]*widget[^"]*"[\s\S]*?<\/div>/g) || [];
  console.log('Widgets count:', widgets.length);
  widgets.forEach((w, i) => {
    console.log(`Widget ${i}:`, w.substring(0, 300).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
  });

  // Check if sidebar has display:none or if layout is no-sidebar
  const bodyClass = html.match(/<body[^>]*class="([^"]*)"/);
  console.log('\nBody classes:');
  if (bodyClass) {
    const classes = bodyClass[1].split(' ');
    console.log(classes.filter(c => c.includes('sidebar') || c.includes('layout') || c.includes('ast-') || c.includes('woo')).join(' '));
  }

  const pos = html.indexOf('id="block-33"');
  if (pos !== -1) {
    const end = html.indexOf('</aside>', pos);
    const block33Html = html.substring(pos, end !== -1 ? end : pos + 15000);
    console.log('\n--- Block 33 text ---');
    console.log(block33Html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
  } else {
    console.log('block-33 not found');
  }
}

inspectShop().catch(console.error);
