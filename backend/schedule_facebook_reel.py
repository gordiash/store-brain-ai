#!/usr/bin/env python3
"""
Facebook Reels Story Scheduler & Publisher for Natura Intimo
Umożliwia planowanie i publikowanie rolek/stories (Reels) na Facebooku
z automatycznym targetowaniem na USA i Kanadę (US/CA geo-gating),
parametrami scheduled_publish_time oraz rejestracją w trackerze operacyjnym.
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
from datetime import datetime, timedelta

TRACKER_FILE = "backend/scheduled_reels_tracker.json"

def load_env():
    env = {}
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip('"\'')
    return env

def schedule_facebook_reel(
    video_url,
    title,
    description,
    scheduled_unix_timestamp=None,
    target_countries=["US", "CA"]
):
    """
    Planuje lub publikuje Reels na Facebooku przez Meta Graph API v20.0
    używając 3-fazowego procesu: start -> upload -> finish
    """
    env = load_env()
    token = env.get("FB_PAGE_TOKEN")
    page_id = env.get("FB_PAGE_ID")

    if not token or not page_id:
        raise ValueError("Brak FB_PAGE_TOKEN lub FB_PAGE_ID w pliku .env!")

    # 1. Pobieranie / weryfikacja pliku wideo
    print(f"[*] Krok 1/3: Inicjalizacja uploadu Reels dla strony {page_id}...")
    init_url = f"https://graph.facebook.com/v20.0/{page_id}/video_reels"
    init_payload = {
        "upload_phase": "start",
        "access_token": token
    }
    
    req = urllib.request.Request(
        init_url,
        data=json.dumps(init_payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(req) as resp:
        init_res = json.loads(resp.read().decode('utf-8'))
        video_id = init_res.get("video_id")
        upload_url = init_res.get("upload_url")
        print(f"    -> Utworzono Video ID: {video_id}")

    # 2. Pobranie bajtów wideo i przesłanie do rupload.facebook.com
    print(f"[*] Krok 2/3: Pobieranie i transfer wideo 9:16 do Meta CDN...")
    v_req = urllib.request.Request(video_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(v_req) as v_resp:
        video_bytes = v_resp.read()
        file_size = len(video_bytes)
        print(f"    -> Rozmiar wideo: {file_size / (1024*1024):.2f} MB")

    up_headers = {
        "Authorization": f"OAuth {token}",
        "offset": "0",
        "file_size": str(file_size),
        "Content-Type": "application/octet-stream"
    }
    up_req = urllib.request.Request(upload_url, data=video_bytes, headers=up_headers, method="POST")
    with urllib.request.urlopen(up_req) as up_resp:
        up_res = json.loads(up_resp.read().decode('utf-8'))
        print(f"    -> Transfer zakończony sukcesem: {up_res.get('success', True)}")

    # 3. Zakończenie i zaplanowanie publikacji
    print(f"[*] Krok 3/3: Konfiguracja parametrów publikacji (US/CA Geo-Gating & Schedule)...")
    
    # Przygotowanie feed_targeting / audience
    targeting = {
        "geo_locations": {
            "countries": target_countries
        }
    }

    finish_payload = {
        "upload_phase": "finish",
        "access_token": token,
        "video_id": video_id,
        "title": title,
        "description": description,
        "feed_targeting": targeting
    }

    if scheduled_unix_timestamp:
        finish_payload["video_state"] = "SCHEDULED"
        finish_payload["scheduled_publish_time"] = int(scheduled_unix_timestamp)
        human_time = datetime.fromtimestamp(scheduled_unix_timestamp).strftime('%Y-%m-%d %H:%M:%S UTC')
        print(f"    -> Status: ZAPLANOWANE na {human_time}")
    else:
        finish_payload["video_state"] = "PUBLISHED"
        print(f"    -> Status: PUBLIKACJA NATYCHMIASTOWA")

    finish_req = urllib.request.Request(
        init_url,
        data=json.dumps(finish_payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(finish_req) as finish_resp:
        finish_res = json.loads(finish_resp.read().decode('utf-8'))
        print(f"[V] Sukces! Odpowiedź Meta: {finish_res}")

    # Rejestracja w trackerze
    tracker_entry = {
        "video_id": video_id,
        "title": title,
        "description": description,
        "target_countries": target_countries,
        "status": finish_payload.get("video_state"),
        "scheduled_time": scheduled_unix_timestamp,
        "scheduled_time_human": datetime.fromtimestamp(scheduled_unix_timestamp).isoformat() if scheduled_unix_timestamp else None,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "api_response": finish_res
    }

    history = []
    if os.path.exists(TRACKER_FILE):
        try:
            with open(TRACKER_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []

    history.append(tracker_entry)
    with open(TRACKER_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

    print(f"[V] Zapisano status do trackera: {TRACKER_FILE}")
    return tracker_entry

if __name__ == "__main__":
    # Domyślny scenariusz: Zaplanowanie Reels Story z kolekcją Gaia Mary Semi-Soft Burgundy
    # na optymalną godzinę w USA (lunch time EST, czyli ok. 18:00 czasu PL / 12:00 PM EST)
    
    # 2 godziny w przód od teraz
    scheduled_epoch = int(time.time()) + (2 * 3600)
    
    video_source = "https://filesamples.com/samples/video/mp4/sample_640x360.mp4"
    
    title = "Why Full-Bust Support Starts With Ribcage Anchoring ✨"
    description = (
        "Why Full-Bust Support Starts With Ribcage Anchoring ✨\n\n"
        "If you wear a US 32DDD, 34G, or 36H, stop letting flimsy elastic bands transfer all the weight onto your shoulder straps!\n\n"
        "European lingerie engineering from Gaia & Gorsenia relies on architectural multi-part seamed cups that lift naturally forward while the firm powernet band secures 85% of breast weight against your ribcage.\n\n"
        "✨ Featured Model: Gaia Mary Semi-Soft in Burgundy (US 32D–42D / EU 70D–95D).\n"
        "✨ Save $10.00 instantly when you pair with matching Brazilian or Bikini briefs at checkout.\n"
        "✈️ 100% Free DHL Express Worldwide Shipping & Duty-Paid Delivery (DDP) to USA on orders $150+ USD (and C$200+ CAD to Canada).\n"
        "✨ 30-Day Hassle-Free Returns & Free First Size Exchange.\n\n"
        "Find your exact sister size conversion:\n"
        "👉 https://naturaintimo.com/size-guide/\n\n"
        "#NaturaIntimo #FullBust #BraFitting #USABrafitting #GaiaLingerie #SupportiveBra #EuropeanLingerie #BodyPositivity"
    )

    print(f"--- Planowanie Facebook Reels Story dla Natura Intimo ---")
    schedule_facebook_reel(
        video_url=video_source,
        title=title,
        description=description,
        scheduled_unix_timestamp=scheduled_epoch,
        target_countries=["US", "CA"]
    )
