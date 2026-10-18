import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

async function testVariations() {
  const testPhp = `
add_action('rest_api_init', function() {
  register_rest_route('natura/v1', '/test-vars', array(
    'methods' => 'GET',
    'permission_callback' => '__return_true',
    'callback' => function($request) {
      $id = (int) $request->get_param('id');
      $p = wc_get_product($id);
      if (!$p) return array('error' => 'not found');
      
      $vars = array();
      if ($p->is_type('variable')) {
        foreach ($p->get_available_variations() as $v) {
          $vars[] = array(
            'id' => $v['variation_id'],
            'attrs' => $v['attributes'],
            'in_stock' => $v['is_in_stock'],
            'price' => $v['display_price']
          );
        }
      }
      return array(
        'product' => $p->get_name(),
        'price' => $p->get_price(),
        'vars' => $vars
      );
    }
  ));
});
`;

  const cur = await fetch(`${url}/wp-json/code-snippets/v1/snippets/9`, {
    headers: { 'Authorization': 'Basic ' + auth }
  }).then(r => r.json());

  await fetch(`${url}/wp-json/code-snippets/v1/snippets/9`, {
    method: 'PUT',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: cur.code + testPhp })
  });

  const res = await fetch(`${url}/wp-json/natura/v1/test-vars?id=3810`);
  const data = await res.json();
  console.log('Product 3810 variations:', JSON.stringify(data, null, 2));
}

testVariations().catch(console.error);
