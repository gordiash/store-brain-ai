import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/9', { headers });
  let code = res.data.code;

  const target = `    // Gather in-stock variations for the matching item
    $matching_variations = array();
    if ( $matching->is_type( 'variable' ) ) {
        foreach ( $matching->get_available_variations() as $var ) {
            if ( ! empty( $var['is_in_stock'] ) ) {
                $size_str = '';
                $color_str = '';
                foreach ( $var['attributes'] as $attr_k => $attr_v ) {
                    if ( stripos( $attr_k, 'size' ) !== false || stripos( $attr_k, 'rozmiar' ) !== false ) {
                        $size_str = strtoupper( $attr_v );
                    } elseif ( stripos( $attr_k, 'color' ) !== false || stripos( $attr_k, 'kolor' ) !== false ) {
                        $color_str = ucfirst( $attr_v );
                    }
                }
                if ( empty( $size_str ) ) {
                    $size_str = implode( ' / ', array_values( $var['attributes'] ) );
                }
                $full_label = ! empty( $color_str ) ? $color_str . ' — ' . $size_str : $size_str;
                $matching_variations[] = array(
                    'id'    => $var['variation_id'],
                    'label' => $full_label,
                    'price' => (float) $var['display_price']
                );
            }
        }
    }`;

  const replacement = `    // Gather in-stock variations for the matching item (Cached with transient for high performance)
    $transient_key = 'ni_match_vars_' . $matching->get_id();
    $matching_variations = get_transient( $transient_key );
    if ( false === $matching_variations ) {
        $matching_variations = array();
        if ( $matching->is_type( 'variable' ) ) {
            foreach ( $matching->get_available_variations() as $var ) {
                if ( ! empty( $var['is_in_stock'] ) ) {
                    $size_str = '';
                    $color_str = '';
                    foreach ( $var['attributes'] as $attr_k => $attr_v ) {
                        if ( stripos( $attr_k, 'size' ) !== false || stripos( $attr_k, 'rozmiar' ) !== false ) {
                            $size_str = strtoupper( $attr_v );
                        } elseif ( stripos( $attr_k, 'color' ) !== false || stripos( $attr_k, 'kolor' ) !== false ) {
                            $color_str = ucfirst( $attr_v );
                        }
                    }
                    if ( empty( $size_str ) ) {
                        $size_str = implode( ' / ', array_values( $var['attributes'] ) );
                    }
                    $full_label = ! empty( $color_str ) ? $color_str . ' — ' . $size_str : $size_str;
                    $matching_variations[] = array(
                        'id'    => $var['variation_id'],
                        'label' => $full_label,
                        'price' => (float) $var['display_price']
                    );
                }
            }
        }
        set_transient( $transient_key, $matching_variations, 12 * HOUR_IN_SECONDS );
    }`;

  if (code.includes(target)) {
    code = code.replace(target, replacement);
    await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/9', { code }, { headers });
    console.log('Snippet 9 updated with transient caching for variations!');
  } else {
    console.log('Target block not found in Snippet 9. Please inspect snippet code.');
  }

  // Purge LiteSpeed Cache
  await axios.post('https://naturaintimo.com/wp-json/ni/v1/purge-cache', {}, { headers });
  console.log('Cache purged.');
}

main().catch(console.error);
