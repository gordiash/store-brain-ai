import requests
import json
import re

# Parse .env
env_vars = {}
with open('.env', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

wp_url = env_vars.get('WOOCOMMERCE_URL', 'https://naturaintimo.com')
wp_user = env_vars.get('WP_ADMIN_USER')
wp_pass = env_vars.get('WP_APP_PASSWORD')

title = "The Ribcage Physics of Full-Bust Support: Why 85% of Lift Comes From the Band (Not the Straps)"
slug = "ribcage-physics-full-bust-support-band-vs-straps"

excerpt = "Discover the 85/15 brafitting physics law: why loose bra bands cause band ride-up and neck pain, how the 2-Finger Snugness Test works, and how European narrow wires provide lift without digging."

content_html = """
<div class="natura-seo-article" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.7; color: #2c2523; max-width: 840px; margin: 0 auto; padding: 20px 0;">

    <!-- Answer-First Box for AI Search & Google Featured Snippets -->
    <div style="background-color: #faf6f7; border-left: 5px solid #b86f82; padding: 22px 26px; border-radius: 6px; margin-bottom: 35px;">
        <h2 style="margin: 0 0 12px 0; color: #2c2523; font-size: 20px; font-weight: 700;">Direct Answer: The 85/15 Brafitting Physics Law</h2>
        <p style="margin: 0; font-size: 16px; font-weight: 500; color: #4a4240;">
            In a properly engineered bra, <strong>85% of breast weight must be anchored by the horizontal band around your ribcage</strong>, while the shoulder straps provide only <strong>15% of gentle stabilization</strong>. When an underband is even one size too loose (such as wearing a US 36DD instead of a true European 32G / EU 70G), the band rides up between the shoulder blades, the underwires tilt forward, and 100% of the gravitational load transfers onto the delicate trapezius nerves—triggering chronic neck stiffness, shoulder grooving, and premature sagging.
        </p>
    </div>

    <h2 style="color: #2c2523; font-size: 24px; font-weight: 700; margin-top: 35px;">1. Anatomy of Band Ride-Up: Why Loose Bands Cause Trapezius Strain</h2>
    <p>
        If your daily routine involves constantly pulling down the back of your bra, or if you end each workday with deep red grooves pressed into your collarbones, you are experiencing the classic symptom of an oversized band.
    </p>
    <p>
        Your ribcage is a rigid skeletal structure capable of supporting substantial mass through friction and leverage. In contrast, your shoulders are mobile joints surrounded by the sensitive trapezius and dorsal nerve pathways. When a bra band fits snugly and sits perfectly horizontal to the floor, it anchors directly against your ribcage bone, bearing the breast weight from below.
    </p>
    <p>
        When the underband is too loose, basic physics takes over:
    </p>
    <ul style="padding-left: 20px; margin-bottom: 25px;">
        <li style="margin-bottom: 8px;"><strong>The Front Downward Pivot:</strong> The weight of the bust pulls the front cups downward.</li>
        <li style="margin-bottom: 8px;"><strong>The Back Ride-Up:</strong> As the front drops, the back band slides upward toward your neck—the path of least resistance.</li>
        <li style="margin-bottom: 8px;"><strong>The False Fix:</strong> Most women react by shortening the shoulder straps. However, shortening straps on a loose band simply levers the back band higher, forcing 100% of the load into the shoulders.</li>
    </ul>

    <h2 style="color: #2c2523; font-size: 24px; font-weight: 700; margin-top: 35px;">2. The 2-Finger Ribcage Snugness Test</h2>
    <p>
        To determine whether your bra band is providing true structural support or merely resting slack against your torso, follow this 4-step diagnostic used by professional European brafitting ateliers:
    </p>
    <ol style="padding-left: 20px; margin-bottom: 25px;">
        <li style="margin-bottom: 10px;"><strong>Fasten on the Loosest Hook:</strong> A new bra should always fit firmly on the first (outermost) set of eyes. Elastic naturally expands over months of laundering; having 2 to 3 inner rows ensures you can tighten the band over time rather than discarding it.</li>
        <li style="margin-bottom: 10px;"><strong>The 2-Finger Check:</strong> Slip two fingers flat between the back band and your spine. You should encounter firm resistance.</li>
        <li style="margin-bottom: 10px;"><strong>The 1-Inch Stretch Limit:</strong> Pull the band directly outward from your spine. You should not be able to pull it more than <strong>1.0 to 1.5 inches (2.5 to 3.8 cm)</strong> away from your body. A band that pulls 2 to 3 inches away is providing zero foundation.</li>
        <li style="margin-bottom: 10px;"><strong>The Overhead Reach:</strong> Raise both arms straight over your head. If the underband slides up onto breast tissue or if underwires dig into your lower ribs, your band is at least 1 to 2 sizes too large.</li>
    </ol>

    <h2 style="color: #2c2523; font-size: 24px; font-weight: 700; margin-top: 35px;">3. European Narrow Wires vs. US Wide Shallow Wires</h2>
    <p>
        Many North American women size up in the band (e.g. choosing a 36DD instead of a 32G) because larger cup sizes in department stores feature wide, shallow underwires that dig painfully into the armpits and latissimus dorsi muscles.
    </p>
    <p>
        Mass-market brands frequently scale up bras by making the wire circle wider and taller, rather than making the cup projection deeper. This causes the infamous <em>"Orange in a Glass"</em> phenomenon: the breast tissue cannot reach the bottom of the cup, so the whole bra slides down, forcing the underwires to crush the ribcage.
    </p>
    <p>
        European master ateliers (such as <strong>Gorsenia, Gaia, and Ava</strong>) employ narrow, heat-tempered steel underwires combined with multi-part cut-and-sewn seamed architecture. This contours closely to the natural inframammary fold, collecting breast tissue gently and projecting it forward for a centered, sculpted silhouette.
    </p>

    <!-- Comparison Table -->
    <div style="overflow-x: auto; margin: 30px 0;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 15px;">
            <thead>
                <tr style="background-color: #f6eef0; border-bottom: 2px solid #b86f82;">
                    <th style="padding: 12px 14px; color: #2c2523;">Structural Feature</th>
                    <th style="padding: 12px 14px; color: #2c2523;">Mass-Market Molded Foam Bras</th>
                    <th style="padding: 12px 14px; color: #2c2523;">European Seamed Ateliers</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #ebe2e4;">
                    <td style="padding: 12px 14px; font-weight: 600;">Primary Support Anchor</td>
                    <td style="padding: 12px 14px; color: #666;">Shoulder straps (fatigue & digging)</td>
                    <td style="padding: 12px 14px; color: #2c2523; font-weight: 600;">Ribcage powernet band (85% lift)</td>
                </tr>
                <tr style="border-bottom: 1px solid #ebe2e4; background-color: #faf7f8;">
                    <td style="padding: 12px 14px; font-weight: 600;">Underwire Curvature</td>
                    <td style="padding: 12px 14px; color: #666;">Wide & flat (pokes into armpits)</td>
                    <td style="padding: 12px 14px; color: #2c2523; font-weight: 600;">Narrow & deep (follows natural root)</td>
                </tr>
                <tr style="border-bottom: 1px solid #ebe2e4;">
                    <td style="padding: 12px 14px; font-weight: 600;">Breast Silhouette</td>
                    <td style="padding: 12px 14px; color: #666;">Flattened backward toward sides</td>
                    <td style="padding: 12px 14px; color: #2c2523; font-weight: 600;">Projected forward and centered</td>
                </tr>
                <tr style="background-color: #faf7f8;">
                    <td style="padding: 12px 14px; font-weight: 600;">Side Support Sling</td>
                    <td style="padding: 12px 14px; color: #666;">Rarely present</td>
                    <td style="padding: 12px 14px; color: #2c2523; font-weight: 600;">Integrated lateral sling for slimming</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Product Recommendation Card -->
    <div style="background-color: #fbf9f9; border: 1px solid #eedde1; border-radius: 8px; padding: 25px; margin: 35px 0;">
        <span style="background-color: #b86f82; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Atelier Recommendation</span>
        <h3 style="color: #2c2523; font-size: 20px; font-weight: 700; margin: 12px 0 8px 0;">
            Gorsenia Paradise K496 Soft Balcony Bra (US 32G–44DDD / EU 70I–100G)
        </h3>
        <p style="margin-bottom: 15px; color: #4a4240; font-size: 15px;">
            Engineered specifically for full busts requiring dependable structural lift without stiff foam bulk. Crafted with multi-part cut-and-sewn lace cups, reinforced side-support slings, and wide ergonomic powernet wings that stay locked parallel against your ribcage all day.
        </p>
        <p style="margin-bottom: 18px; color: #2c2523; font-size: 14px;">
            ✨ <strong>Coordinated Atelier Discount:</strong> Pair with matching <a href="https://naturaintimo.com/product/panties-gorsenia-k-498-paradise-brazilian-briefs/" style="color: #b86f82; font-weight: 600; text-decoration: underline;">Gorsenia Paradise K498 Brazilian Briefs</a> to enjoy an automatic <strong>USD 10.00 Set Savings</strong> discount at checkout.
        </p>
        <a href="https://naturaintimo.com/product/bra-soft-gorsenia-k-496-paradise/" style="display: inline-block; background-color: #2c2523; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; font-size: 14px;">
            Explore Gorsenia Paradise K496 &rarr;
        </a>
    </div>

    <h2 style="color: #2c2523; font-size: 24px; font-weight: 700; margin-top: 35px;">4. Frequently Asked Questions (FAQ)</h2>
    
    <div style="margin-bottom: 20px;">
        <h3 style="color: #2c2523; font-size: 17px; font-weight: 700; margin-bottom: 6px;">Why does my bra band feel too tight when I try my true smaller band size?</h3>
        <p style="color: #4a4240; margin: 0; font-size: 15px;">
            Cups that are too small or too shallow force breast tissue backward out of the cup and into the band, artificially stretching the band and making it feel suffocating. To test if the band itself is truly the right size, fasten the bra upside down and backward (with the cups hanging down your back). If the band feels comfortable and snug on the loosest hook, your band size is correct, and you need to go up 1 to 2 cup sizes to accommodate your full volume.
        </p>
    </div>

    <div style="margin-bottom: 20px;">
        <h3 style="color: #2c2523; font-size: 17px; font-weight: 700; margin-bottom: 6px;">How do US bra sizes translate to European sizing?</h3>
        <p style="color: #4a4240; margin: 0; font-size: 15px;">
            European bra bands are measured in centimeters: 30 US = 65 EU, 32 US = 70 EU, 34 US = 75 EU, 36 US = 80 EU, and 38 US = 85 EU. European cups advance in uniform 2 cm volume steps (A, B, C, D, E, F, G, H, I, J, K) without confusing double or triple letters. For example, a US 32DDD corresponds to EU 70F, while a US 32G converts to EU 70G. You can verify your exact sister size conversion using our <a href="https://naturaintimo.com/size-guide/" style="color: #b86f82; font-weight: 600; text-decoration: underline;">Interactive European Size Converter</a>.
        </p>
    </div>

    <div style="margin-bottom: 20px;">
        <h3 style="color: #2c2523; font-size: 17px; font-weight: 700; margin-bottom: 6px;">How does shipping and returns work from Europe to the United States and Canada?</h3>
        <p style="color: #4a4240; margin: 0; font-size: 15px;">
            Every order is dispatched direct from our European atelier hub via <strong>DHL Express Worldwide air transit (2–4 business days)</strong>. All customs duties and brokerage fees are pre-cleared <strong>DDP (Delivered Duty Paid)</strong>, guaranteeing zero surprise delivery fees (in strict compliance with California SB 478 and Canadian Competition Bureau guidelines). We offer <strong>100% FREE DHL Express shipping on orders over USD 150 (and over CAD 200 to Canada)</strong>, with a hassle-free 30-day Free First Size Exchange policy.
        </p>
    </div>

</div>

<!-- Structured Schema.org JSON-LD FAQPage for AI Search Engines & Google Rich Results -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why does 85% of bra support come from the band instead of the straps?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In a properly fitted bra, 85% of breast weight is anchored by the horizontal band around the rigid skeletal ribcage, while shoulder straps provide only 15% of gentle stabilization. A loose band causes the back to ride up, transferring 100% of gravitational weight onto delicate shoulder nerves."
      }
    },
    {
      "@type": "Question",
      "name": "How does the 2-Finger Bra Snugness Test work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fasten a new bra on its loosest hook row and slide two fingers flat between the band and your spine. You should feel firm resistance and be unable to pull the band more than 1.0 to 1.5 inches away from your body. Raising your arms overhead should not cause the band to shift."
      }
    },
    {
      "@type": "Question",
      "name": "How do Polish and European bra sizes convert to US sizes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "European bra bands are sized in centimeters (30 US = 65 EU, 32 US = 70 EU, 34 US = 75 EU, 36 US = 80 EU). European cups advance in consistent 2 cm steps without double letters, meaning a US 32DDD converts to EU 70F, and a US 32G converts to EU 70G."
      }
    },
    {
      "@type": "Question",
      "name": "How does cross-border shipping to the US and Canada work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Orders ship directly from Europe via DHL Express Worldwide in 2 to 4 business days. All duties are pre-cleared DDP with zero surprise fees. Shipping is 100% free on orders over USD 150 (CAD 200 to Canada) with a 30-day Free First Size Exchange guarantee."
      }
    }
  ]
}
</script>
"""

# Publish to WordPress
endpoint = f"{wp_url}/wp-json/wp/v2/posts"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

payload = {
    'title': title,
    'slug': slug,
    'excerpt': excerpt,
    'content': content_html,
    'status': 'publish',
    'categories': [93] # Brafitting & Guides
}

print("Publishing blog article to WordPress...")
res = requests.post(
    endpoint,
    auth=(wp_user, wp_pass),
    headers=headers,
    json=payload
)

print(f"Status Code: {res.status_code}")
if res.status_code in [200, 201]:
    data = res.json()
    print(f"Successfully published post ID: {data.get('id')}")
    print(f"Post URL: {data.get('link')}")
    print(f"Post Title: {data.get('title', {}).get('rendered')}")
else:
    print(f"Failed to publish: {res.text[:300]}")
