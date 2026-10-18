import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function test() {
  const cur = await fetch(`${url}/wp-json/code-snippets/v1/snippets/9`, {
    headers: { 'Authorization': 'Basic ' + auth }
  }).then(r => r.json());

  const testPhp = `
add_action('rest_api_init', function() {
  register_rest_route('natura/v1', '/test-matching', array(
    'methods' => 'GET',
    'permission_callback' => '__return_true',
    'callback' => function($request) {
      $id = (int) $request->get_param('id');
      $p = wc_get_product($id);
      if (!$p) return array('error' => 'Product not found');
      
      $matching_id = get_post_meta($id, '_matching_product_id', true);
      $upsells = $p->get_upsell_ids();
      $matching_p = $matching_id ? wc_get_product($matching_id) : null;
      
      return array(
        'product_id' => $id,
        'name' => $p->get_name(),
        'matching_meta' => $matching_id,
        'upsells' => $upsells,
        'matching_name' => $matching_p ? $matching_p->get_name() : null,
        'matching_status' => $matching_p ? $matching_p->get_status() : null,
        'matching_price' => $matching_p ? $matching_p->get_price_html() : null
      );
    }
  ));
});
`;

  await fetch(`${url}/wp-json/code-snippets/v1/snippets/9`, {
    method: 'PUT',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: cur.code + testPhp })
  });

  const res = await fetch(`${url}/wp-json/natura/v1/test-matching?id=3777`);
  const data = await res.json();
  console.log('API Test result:', data);
}

test().catch(console.error);
