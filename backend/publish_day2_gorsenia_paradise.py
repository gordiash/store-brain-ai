import os
import json
import time
import urllib.request

if os.path.exists('.env'):
    for line in open('.env'):
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            os.environ[k] = v.strip('\"\'')

token = os.getenv('FB_PAGE_TOKEN')
page_id = os.getenv('FB_PAGE_ID')
ig_id = os.getenv('IG_ACCOUNT_ID')

if not token or not page_id or not ig_id:
    raise RuntimeError("Missing FB/IG credentials in .env")

print("1. Publishing Facebook Post (Gorsenia K496 Paradise)...")

fb_message = """Architectural Full-Bust Support: Gorsenia K496 Paradise Black 🖤

If you wear a US DD, DDD, G, or H+ cup, you know the struggle of shallow, molded foam bras that flatten breast tissue toward your armpits while flimsy bands force shoulder straps to dig in painfully.

The iconic Gorsenia K496 Paradise solves this through precision European lingerie engineering:

📐 Multi-Part Cut-and-Sewn Construction: 3-piece seamed cups offer superior forward projection and centering for fuller busts (EU 70I–100G / US 32I–44G).
🔒 Firm Ribcage Anchoring: High-density European powernet bands carry the weight of the bust, completely freeing your shoulders from tension.
✨ Automatic Set Savings: Pair with matching Gorsenia Paradise Brazilian Briefs (Sizes M–2XL) and enjoy an automatic $10.00 Set Savings discount at checkout.

✈️ Direct Express Delivery Duty Paid (DDP):
All orders ship directly from Poland via DHL Express Worldwide (2–4 business days air transit).
• Standard flat rate: $24.99 USD (Pre-cleared DDP — zero surprise delivery fees, California SB 478 compliant).
• 100% FREE DHL Express Shipping & Customs Duties on all orders of $150.00+ USD (and C$200.00+ CAD with 0% CETA preferential duty).
• 30-Day Returns & Complimentary Free First Size Exchange.

Find your exact European band and cup size with our interactive size converter:
👉 https://naturaintimo.com/size-guide/

Explore the Gorsenia K496 Paradise collection:
👉 https://naturaintimo.com/product/bra-soft-gorsenia-k-496-paradise/"""

img_urls = [
    'https://naturaintimo.com/wp-content/uploads/2026/09/384060.jpg',
    'https://naturaintimo.com/wp-content/uploads/2026/09/384059.jpg',
    'https://naturaintimo.com/wp-content/uploads/2026/10/gorsenia_paradise_panties_clean_gmc.jpg'
]

# Upload FB photos as unpublished first
fb_media_ids = []
for u in img_urls:
    d = json.dumps({'url': u, 'published': False, 'access_token': token}).encode()
    rq = urllib.request.Request(f'https://graph.facebook.com/v20.0/{page_id}/photos', data=d, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(rq) as r:
        fb_media_ids.append(json.loads(r.read().decode())['id'])

fb_post_payload = json.dumps({
    'message': fb_message,
    'attached_media': [{'media_fbid': mid} for mid in fb_media_ids],
    'access_token': token
}).encode()

fb_req = urllib.request.Request(f'https://graph.facebook.com/v20.0/{page_id}/feed', data=fb_post_payload, headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(fb_req) as fr:
    new_fb_post = json.loads(fr.read().decode())
    print("SUCCESS: Facebook Post Published. ID:", new_fb_post.get('id'))

time.sleep(3)

print("2. Publishing Instagram Carousel (Gorsenia K496 Paradise)...")

ig_caption = """Architectural Full-Bust Support: Gorsenia K496 Paradise Black 🖤

Engineered specifically for fuller cup sizes (EU 70I–100G / US 32I–44G), the iconic Gorsenia K496 Paradise delivers structural lift without bulky molded foam padding:

📐 Multi-Part Cut-and-Sewn Cups: 3-piece vertical and diagonal seaming projects breast tissue forward naturally rather than flattening it towards armpits.
🔒 Powernet Band Anchoring: The firm, breathable European powernet band bears 85% of bust weight, completely relieving neck and shoulder tension.
✨ Coordinated Set: Pair with matching Gorsenia Paradise Brazilian Briefs (Sizes M–2XL) and save $10.00 instantly at checkout.

Dispatched directly from Poland via DHL Express Worldwide (2–4 business days delivery). Pre-cleared DDP customs with zero surprise delivery fees.

Browse sizes & fit guidance at naturaintimo.com (link in bio).

#NaturaIntimo #Gorsenia #GorseniaK496 #FullBust #BraFitting #EuropeanLingerie #LingerieSet #DDPlus #SupportiveBra"""

ig_item_ids = []
for u in img_urls:
    d = json.dumps({'image_url': u, 'is_carousel_item': True, 'access_token': token}).encode()
    rq = urllib.request.Request(f'https://graph.facebook.com/v20.0/{ig_id}/media', data=d, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(rq) as r:
        ig_item_ids.append(json.loads(r.read().decode())['id'])

car_data = json.dumps({
    'media_type': 'CAROUSEL',
    'children': ig_item_ids,
    'caption': ig_caption,
    'access_token': token
}).encode()

rq_car = urllib.request.Request(f'https://graph.facebook.com/v20.0/{ig_id}/media', data=car_data, headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(rq_car) as r:
    car_id = json.loads(r.read().decode())['id']

time.sleep(4)

rq_pub = urllib.request.Request(f'https://graph.facebook.com/v20.0/{ig_id}/media_publish', data=json.dumps({
    'creation_id': car_id,
    'access_token': token
}).encode(), headers={'Content-Type': 'application/json'}, method='POST')

with urllib.request.urlopen(rq_pub) as r:
    new_ig = json.loads(r.read().decode())
    print("SUCCESS: Instagram Carousel Published. ID:", new_ig.get('id'))
