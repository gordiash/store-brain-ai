import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const snippetCode = `
add_action('rest_api_init', function() {
    register_rest_route('ni/v1', '/speed-debug', array(
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function() {
            global $wpdb;
            $patterns = array('%css%', '%js%', '%optm%', '%crawler%', '%media%');
            $out = array();
            foreach ($patterns as $p) {
                $rows = $wpdb->get_results($wpdb->prepare("SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE %s", 'litespeed.conf.' . $p));
                foreach ($rows as $r) {
                    $val = maybe_unserialize($r->option_value);
                    $out[$r->option_name] = is_array($val) ? json_encode($val) : strval($val);
                }
            }
            return $out;
        }
    ));
});
`;

  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { headers });
  let code = res.data.code;
  // If old debug exists, replace it
  const pattern = /add_action\('rest_api_init', function\(\) \{\s+register_rest_route\('ni\/v1', '\/speed-debug'[\s\S]*?\n\}\);\n\};\n\?/m;
  if (code.includes('/speed-debug')) {
    // Replace snippet 14 cleanly
    const baseCodeRes = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { headers });
    let cleanCode = baseCodeRes.data.code;
    const splitIndex = cleanCode.indexOf("register_rest_route('ni/v1', '/speed-debug'");
    if (splitIndex !== -1) {
      const before = cleanCode.substring(0, cleanCode.lastIndexOf("add_action('rest_api_init'", splitIndex));
      cleanCode = before + snippetCode;
      await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { code: cleanCode }, { headers });
      console.log('Updated /ni/v1/speed-debug in snippet 14');
    }
  } else {
    code += snippetCode;
    await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { code }, { headers });
  }

  const debugRes = await axios.get('https://naturaintimo.com/wp-json/ni/v1/speed-debug');
  console.log('LiteSpeed DB options:');
  console.log(JSON.stringify(debugRes.data, null, 2));
}

main().catch(console.error);
