import dotenv from 'dotenv';
dotenv.config();

const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';
const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const auth = Buffer.from(ck + ':' + cs).toString('base64');

async function fetchProducts() {
  const res = await fetch(`${url}/wp-json/wc/v3/products?status=publish&per_page=30&orderby=popularity&order=desc`, {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const products = await res.json();
  
  const selection = products
    .filter(p => p.images && p.images.length > 0 && p.price)
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      regular_price: p.regular_price,
      sale_price: p.sale_price,
      permalink: p.permalink,
      image: p.images[0].src,
      categories: p.categories.map(c => c.name)
    }));

  console.log(JSON.stringify(selection, null, 2));
}

fetchProducts().catch(console.error);
