import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import fs from 'fs';

async function updateSnippet9() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const currentCode = fs.readFileSync('c:\\Users\\jaros\\Desktop\\TikTok Agent\\backend\\snippet_9_current.php', 'utf8');

  // Replace variation extraction logic
  const oldLogic = `    // Gather in-stock variations for the matching item
    $matching_variations = array();
    if ( $matching->is_type( 'variable' ) ) {
        foreach ( $matching->get_available_variations() as $var ) {
            if ( ! empty( $var['is_in_stock'] ) ) {
                $size_str = '';
                foreach ( $var['attributes'] as $attr_k => $attr_v ) {
                    if ( stripos( $attr_k, 'size' ) !== false || stripos( $attr_k, 'rozmiar' ) !== false ) {
                        $size_str = strtoupper( $attr_v );
                    }
                }
                if ( empty( $size_str ) ) {
                    $size_str = implode( ' / ', array_values( $var['attributes'] ) );
                }
                $matching_variations[] = array(
                    'id'    => $var['variation_id'],
                    'label' => $size_str,
                    'price' => (float) $var['display_price']
                );
            }
        }
    }`;

  const newLogic = `    // Gather in-stock variations for the matching item
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

  if (!currentCode.includes(oldLogic)) {
    console.error('Target old logic not found in snippet 9!');
    process.exit(1);
  }

  const updatedCode = currentCode.replace(oldLogic, newLogic);

  const res = await axios.put('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/9', {
    code: updatedCode
  }, { headers });

  console.log('Snippet #9 updated successfully! Active:', res.data.active);
}

updateSnippet9().catch(console.error);
