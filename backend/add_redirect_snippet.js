import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { headers });
  let code = res.data.code;

  code = code.replace("function ni_redirect_legacy_produkt_urls() {", `function ni_redirect_legacy_produkt_urls() {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($uri, '/produkt/') !== false) {
        $new_uri = str_replace('/produkt/', '/product/', $uri);
        header("Location: " . home_url($new_uri), true, 301);
        exit;
    }`);
  await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { code }, { headers });
  console.log('Snippet 14 updated with robust header 301 redirect!');
}

main().catch(console.error);
