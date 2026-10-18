import os
import json
import time
import urllib.request

with open('.env') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

token = env.get('FB_PAGE_TOKEN')
page_id = env.get('FB_PAGE_ID')
ig_id = env.get('IG_ACCOUNT_ID')

print("1. Publishing corrected Facebook post...")

fb_message = """Why Full-Bust Bras From Poland Are Redefining Support Across the US & Canada ✨

If you wear a US DD, DDD, G, or H cup, you know the frustration of molded foam bras that flatten breast tissue toward your armpits while flimsy bands let your straps dig painfully into your shoulders.

European lingerie engineering from heritage ateliers like Gorsenia, Gaia, and Ava solves this with structural architectural brafitting:

📐 Multi-Part Cut-and-Sewn Construction: 3-piece and 4-piece seamed cups project the bust naturally forward rather than flattening it sideways.
🔒 Ribcage Anchoring: Firm powernet bands bear 85% of breast weight, completely freeing your shoulders from tension.
✨ Coordinated Sets: Pair your favorite bra with matching bottoms (Brazilian briefs, bikini briefs, or high-waist cuts) and enjoy an automatic $10.00 Set Savings discount at checkout.

✈️ Direct Express Delivery Duty Paid (DDP):
All orders ship directly from our European atelier in Poland via DHL Express Worldwide (2–4 business days air transit).
• Standard flat rate: $24.99 USD (Pre-cleared DDP — zero surprise delivery fees, California SB 478 compliant).
• 100% FREE DHL Express Shipping & Customs Duties on all orders of $150.00+ USD (and C$200.00+ CAD with 0% CETA preferential duty).
• 30-Day Returns & Complimentary Free First Size Exchange.

Find your exact European band and cup size with our interactive size converter:
👉 https://naturaintimo.com/size-guide/

Browse signature European collections:
👉 https://naturaintimo.com/"""

data1 = json.dumps({
    'url': 'https://naturaintimo.com/wp-content/uploads/2026/09/414787.jpg',
    'published': False,
    'access_token': token
}).encode()
req1 = urllib.request.Request(f'https://graph.facebook.com/v20.0/{page_id}/photos', data=data1, headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(req1) as r1:
    p1 = json.loads(r1.read().decode())['id']

data2 = json.dumps({
    'url': 'https://naturaintimo.com/wp-content/uploads/2026/09/414796.jpg',
    'published': False,
    'access_token': token
}).encode()
req2 = urllib.request.Request(f'https://graph.facebook.com/v20.0/{page_id}/photos', data=data2, headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(req2) as r2:
    p2 = json.loads(r2.read().decode())['id']

fb_post_payload = json.dumps({
    'message': fb_message,
    'attached_media': [{'media_fbid': p1}, {'media_fbid': p2}],
    'access_token': token
}).encode()
fb_req = urllib.request.Request(f'https://graph.facebook.com/v20.0/{page_id}/feed', data=fb_post_payload, headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(fb_req) as fr:
    new_fb_post = json.loads(fr.read().decode())
    print("NEW FB POST ID:", new_fb_post.get('id'))

time.sleep(3)

print("2. Publishing corrected Instagram Post 1 (Gorsenia Nadine)...")

ig1_caption = """Coordinated European Lingerie Set: Gorsenia Nadine ✨

Feminine embroidery, dependable support, and everyday comfort crafted for fuller busts.

• Gorsenia Nadine Soft Bra (EU 65F–115D / US 30DDD–50D)
• Gorsenia Nadine Briefs (Sizes M–3XL)
• Multi-part cut-and-sewn cups with firm underwire support
• Save $10.00 instantly when pairing matching bra and bottom

Dispatched directly from Poland via DHL Express Worldwide (2–4 business days delivery). Pre-cleared DDP customs with zero surprise delivery fees.

Explore the collection & size converter at naturaintimo.com (link in bio).

#NaturaIntimo #Gorsenia #FullBust #LingerieSet #EuropeanLingerie #BraFitting #SoftBra #DDPlus"""

images1 = [
    'https://naturaintimo.com/wp-content/uploads/2026/09/414787.jpg',
    'https://naturaintimo.com/wp-content/uploads/2026/09/414788.jpg',
    'https://naturaintimo.com/wp-content/uploads/2026/09/414796.jpg'
]

item_ids1 = []
for img in images1:
    d = json.dumps({'image_url': img, 'is_carousel_item': True, 'access_token': token}).encode()
    rq = urllib.request.Request(f'https://graph.facebook.com/v20.0/{ig_id}/media', data=d, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(rq) as r:
        item_ids1.append(json.loads(r.read().decode())['id'])

car_data1 = json.dumps({
    'media_type': 'CAROUSEL',
    'children': item_ids1,
    'caption': ig1_caption,
    'access_token': token
}).encode()
rq_car1 = urllib.request.Request(f'https://graph.facebook.com/v20.0/{ig_id}/media', data=car_data1, headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(rq_car1) as r:
    car_id1 = json.loads(r.read().decode())['id']

time.sleep(4)

rq_pub1 = urllib.request.Request(f'https://graph.facebook.com/v20.0/{ig_id}/media_publish', data=json.dumps({
    'creation_id': car_id1,
    'access_token': token
}).encode(), headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(rq_pub1) as r:
    new_ig1 = json.loads(r.read().decode())
    print("NEW IG 1 POST ID:", new_ig1.get('id'))

time.sleep(3)

print("3. Publishing corrected Instagram Post 2 (Gaia BS 1135 Beige)...")

ig2_caption = """Refined Everyday Support: Gaia BS 1135 & GFB 1135 Beige 🤍

Lightweight, unpadded comfort designed to move naturally with your body.

• Gaia BS 1135 Soft Bra (EU 65E–95E / US 30DD–42DD)
• Gaia GFB 1135 Brazilian Briefs (Sizes S–2XL)
• Delicate, breathable European lace in a versatile skin-tone beige
• Complete the set and save $10.00 instantly at checkout

Dispatched directly from Poland via DHL Express Worldwide (2–4 business days delivery). Pre-cleared DDP customs with zero surprise delivery fees.

Browse sizes & fit guidance at naturaintimo.com (link in bio).

#NaturaIntimo #GaiaLingerie #EverydayLingerie #BeigeBra #EuropeanLingerie #BraFitting #SoftBra #LingerieSet"""

images2 = [
    'https://naturaintimo.com/wp-content/uploads/2026/09/349715.jpg',
    'https://naturaintimo.com/wp-content/uploads/2026/09/349712.jpg',
    'https://naturaintimo.com/wp-content/uploads/2026/09/349605.jpg'
]

item_ids2 = []
for img in images2:
    d = json.dumps({'image_url': img, 'is_carousel_item': True, 'access_token': token}).encode()
    rq = urllib.request.Request(f'https://graph.facebook.com/v20.0/{ig_id}/media', data=d, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(rq) as r:
        item_ids2.append(json.loads(r.read().decode())['id'])

car_data2 = json.dumps({
    'media_type': 'CAROUSEL',
    'children': item_ids2,
    'caption': ig2_caption,
    'access_token': token
}).encode()
rq_car2 = urllib.request.Request(f'https://graph.facebook.com/v20.0/{ig_id}/media', data=car_data2, headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(rq_car2) as r:
    car_id2 = json.loads(r.read().decode())['id']

time.sleep(4)

rq_pub2 = urllib.request.Request(f'https://graph.facebook.com/v20.0/{ig_id}/media_publish', data=json.dumps({
    'creation_id': car_id2,
    'access_token': token
}).encode(), headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(rq_pub2) as r:
    new_ig2 = json.loads(r.read().decode())
    print("NEW IG 2 POST ID:", new_ig2.get('id'))
