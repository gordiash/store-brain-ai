import dotenv from 'dotenv';
dotenv.config();

const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function checkProduct3442() {
  const res = await fetch(siteUrl + '/new-arrivals/?v=' + Date.now());
  const html = await res.text();
  const idx = html.indexOf('post-3442');
  if (idx !== -1) {
    const start = html.lastIndexOf('<li', idx);
    const end = html.indexOf('>', idx);
    console.log('Post 3442 class string:\n', html.substring(start, end + 1));
  } else {
    console.log('Post 3442 not found on page');
  }
}
checkProduct3442().catch(console.error);
