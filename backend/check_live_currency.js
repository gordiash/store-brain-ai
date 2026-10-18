import axios from 'axios';

async function main() {
  const url = 'https://naturaintimo.com/produkt/bra-semi-soft-ava-2110/?attribute_color=White&attribute_size=95D';
  
  // 1. Regular request from local IP (Poland)
  const r1 = await axios.get(url);
  const jsonLdMatch1 = r1.data.match(/"priceCurrency":"([^"]+)"/g);
  const symbolMatch1 = r1.data.match(/<span class="woocommerce-Price-currencySymbol">([^<]+)<\/span>/g);
  console.log('--- Request from local IP (Poland) ---');
  console.log('JSON-LD currencies:', jsonLdMatch1);
  console.log('HTML currency symbols:', symbolMatch1 ? symbolMatch1.slice(0, 5) : null);

  // 2. Request with US IP simulation (X-Forwarded-For)
  const r2 = await axios.get(url, {
    headers: {
      'X-Forwarded-For': '66.249.66.1', // Googlebot US IP
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    }
  });
  const m = r1.data.match(/(\$[0-9\.]+|[0-9\.,]+\s*(zł|PLN))/gi);
  console.log('Price matches on page:');
  console.log(m ? m.slice(0, 10) : 'none');
}

main().catch(console.error);
