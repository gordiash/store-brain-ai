import os
import time
import requests

# Load .env
env_vars = {}
with open('.env', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

token = env_vars.get('FB_PAGE_TOKEN')
ig_id = env_vars.get('IG_ACCOUNT_ID', '17841428136710713')
headers = {'Authorization': f'Bearer {token}'}

# Day 1 - Monday 02.11 Gaia Mary Burgundy
image_url = "https://naturaintimo.com/wp-content/uploads/2026/09/439272.jpg"

caption = """If your bra straps leave deep red marks at the end of the day, your band is doing 0% of the work. ✨

Every month you spend wearing a loose band and compensating with tight straps, you place immense gravitational strain on delicate trapezius nerves and Cooper's ligaments. 

In European brafitting ateliers, the physics of lift is completely inverted:
📐 Multi-Part Cut-and-Sewn Construction: Seamed 3-piece lower cups project breast tissue forward and centered — never pushed flat into your underarms.
🔒 Powernet Ribcage Anchoring: The firm, breathable side band secures 85% of breast weight firmly against your ribcage bone, liberating your neck and shoulders from chronic tension.

✨ Featured: Gaia Mary BS 1372 Semi-Soft Bra in Rich Burgundy (US 32D–42D / EU 70D–95D).
✨ Set Savings: Save USD 10.00 / CAD 13.00 instantly when completing the coordinated set with matching briefs.
✈️ 100% FREE DHL Express Worldwide Shipping direct from Europe on orders USD 150+ / CAD 200+.
📦 Pre-cleared DDP customs — zero surprise delivery fees (California SB 478 compliant).
✨ 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.

💬 Be honest: How many years have you been wearing your current bra size without getting remeasured? Drop a comment below! 👇
🔗 (Direct link to our European conversion guide & atelier collection is in our bio and first comment)

#NaturaIntimo #FullBust #BraFitting #USABrafitting #GaiaLingerie #SupportiveBra #EuropeanLingerie #BodyPositivity"""

first_comment = "🔗 Direct link to our European conversion guide & atelier collection: https://naturaintimo.com/size-guide/"

print("--- Step 1: Creating Instagram Media Container ---")
container_payload = {
    'image_url': image_url,
    'caption': caption
}
res_c = requests.post(f"https://graph.facebook.com/v21.0/{ig_id}/media", headers=headers, json=container_payload)
print("Create container response:", res_c.status_code, res_c.json())

creation_id = res_c.json().get('id')
if not creation_id:
    print("Failed to create container.")
    exit(1)

print(f"Container ID: {creation_id}. Waiting for processing...")
for attempt in range(15):
    time.sleep(3)
    status_res = requests.get(f"https://graph.facebook.com/v21.0/{creation_id}?fields=status_code,status", headers=headers)
    st = status_res.json()
    print(f"Status attempt {attempt+1}:", st.get('status_code'))
    if st.get('status_code') == 'FINISHED':
        break

print("\n--- Step 2: Publishing Instagram Container ---")
pub_res = requests.post(f"https://graph.facebook.com/v21.0/{ig_id}/media_publish", headers=headers, json={'creation_id': creation_id})
print("Publish response:", pub_res.status_code, pub_res.json())

media_id = pub_res.json().get('id')
if media_id:
    print(f"Post successfully published on Instagram! Media ID: {media_id}")
    time.sleep(2)
    # Step 3: Post First Comment
    print("\n--- Step 3: Adding First Comment with Link ---")
    comm_res = requests.post(f"https://graph.facebook.com/v21.0/{media_id}/comments", headers=headers, json={'message': first_comment})
    print("Comment response:", comm_res.status_code, comm_res.json())

    # Get permalink
    p_res = requests.get(f"https://graph.facebook.com/v21.0/{media_id}?fields=permalink", headers=headers)
    print("Live Instagram Permalink:", p_res.json().get('permalink'))
