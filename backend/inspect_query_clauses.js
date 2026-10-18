import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function inspect() {
  const code = `
add_action('rest_api_init', function() {
  register_rest_route('natura/v1', '/debug-query', array(
    'methods' => 'GET',
    'permission_callback' => '__return_true',
    'callback' => function() {
      $file = WP_PLUGIN_DIR . '/woocommerce/src/Internal/ProductFilters/QueryClauses.php';
      $lines = file($file);
      return array(
        'chunk' => array_slice($lines, 450, 65)
      );
    }
  ));
});
`;

  const put = () => new Promise(resolve => {
    const postData = JSON.stringify({ name: 'Debug Query Snippet', code: code, active: true });
    const req = https.request('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/6', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + wpAuth, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.write(postData);
    req.end();
  });

  await put();

  const res = await fetch('https://naturaintimo.com/wp-json/natura/v1/debug-query');
  const data = await res.json();
  console.log('QueryClauses chunk:');
  console.log(data.chunk ? data.chunk.join('') : data);

  // Deactivate 6
  const putOff = () => new Promise(resolve => {
    const postData = JSON.stringify({ active: false });
    const req = https.request('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/6', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + wpAuth, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => resolve());
    req.write(postData);
    req.end();
  });
  await putOff();
}

inspect().catch(console.error);
