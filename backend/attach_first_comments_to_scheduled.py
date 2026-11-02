import os
import json
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
headers = {'Authorization': f'Bearer {token}'}

# The scheduled posts mapping for remaining days (Tue 03.11 - Sun 08.11):
comments_plan = [
    {
        "day": "Tuesday 2026-11-03",
        "post_id": "1082888234909700_122126109885297993",
        "comment": "🔗 Direct link to our UK-to-European size conversion guide & Gorsenia Paradise collection: https://naturaintimo.com/size-guide/"
    },
    {
        "day": "Wednesday 2026-11-04",
        "post_id": "1082888234909700_122126843931297993",
        "comment": "🔗 Direct link to our Australian dress size conversion guide & Gorsenia Luisse collection: https://naturaintimo.com/size-guide/"
    },
    {
        "day": "Thursday 2026-11-05",
        "post_id": "1082888234909700_122126110071297993",
        "comment": "🔗 Direct link to our everyday soft bra collection & size converter: https://naturaintimo.com/size-guide/"
    },
    {
        "day": "Friday 2026-11-06",
        "post_id": "1082888234909700_122126843991297993",
        "comment": "🔗 Direct link to our haute atelier collection & size converter: https://naturaintimo.com/size-guide/"
    },
    {
        "day": "Saturday 2026-11-07",
        "post_id": "1082888234909700_122126110137297993",
        "comment": "🔗 Direct link to our interactive European sister size conversion calculator: https://naturaintimo.com/size-guide/"
    },
    {
        "day": "Sunday 2026-11-08",
        "post_id": "1082888234909700_122126844069297993",
        "comment": "🔗 Direct link to explore coordinated European atelier sets & size converter: https://naturaintimo.com/size-guide/"
    }
]

print("--- Pre-attaching first comments to all scheduled posts ---")
for item in comments_plan:
    pid = item["post_id"]
    day = item["day"]
    comm = item["comment"]
    
    # Check if comment already exists
    r_check = requests.get(f"https://graph.facebook.com/v21.0/{pid}/comments", headers=headers)
    existing = r_check.json().get("data", [])
    has_link = any("https://naturaintimo.com" in c.get("message", "") for c in existing)
    
    if has_link:
        print(f"[{day}] Post {pid} already has a link comment.")
    else:
        res = requests.post(f"https://graph.facebook.com/v21.0/{pid}/comments", headers=headers, json={"message": comm})
        print(f"[{day}] Attached first comment to {pid}:", res.status_code, res.json())

print("\nAll scheduled posts now have pre-attached first comments!")
