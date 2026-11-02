import os
import json
import time
import requests
from datetime import datetime, timezone

# Workspace paths
WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CALENDAR_PATH = os.path.join(WORKSPACE_DIR, "backend", "content_calendar_next_week.json")
TRACKER_PATH = os.path.join(WORKSPACE_DIR, "backend", "instagram_publishing_tracker.json")
ENV_PATH = os.path.join(WORKSPACE_DIR, ".env")

def load_env():
    env = {}
    if os.path.exists(ENV_PATH):
        for line in open(ENV_PATH):
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip("\"'")
    return env

def load_tracker():
    if os.path.exists(TRACKER_PATH):
        try:
            with open(TRACKER_PATH, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_tracker(tracker):
    with open(TRACKER_PATH, "w") as f:
        json.dump(tracker, f, indent=2)

def check_and_publish_instagram():
    env = load_env()
    token = env.get("FB_PAGE_TOKEN")
    ig_id = env.get("IG_ACCOUNT_ID", "17841428136710713")
    
    if not token or not ig_id:
        print("[IG Publisher] Brak tokenu lub IG_ACCOUNT_ID w .env")
        return

    headers = {"Authorization": f"Bearer {token}"}
    tracker = load_tracker()

    if not os.path.exists(CALENDAR_PATH):
        print("[IG Publisher] Brak pliku kalendarza:", CALENDAR_PATH)
        return

    with open(CALENDAR_PATH, "r") as f:
        cal = json.load(f)

    # Current local date & hour (Warsaw/CET)
    # Target publication hour is 16:00 UTC (17:00 CET)
    now_utc = datetime.now(timezone.utc)
    current_date_str = now_utc.strftime("%Y-%m-%d")
    current_hour_utc = now_utc.hour

    print(f"[IG Publisher] Heartbeat check: {now_utc.isoformat()} (UTC Hour: {current_hour_utc})")

    for item in cal.get("schedule", []):
        post_date = item.get("date")
        
        # Check if it is due (today or past due, and after 15:00 UTC = 16:00 CET)
        # Or if it's today and hour >= 16 UTC (17 CET)
        if post_date > current_date_str:
            continue # Future post

        if post_date == current_date_str and current_hour_utc < 15:
            continue # Not yet time today

        # Check if already published
        if tracker.get(post_date, {}).get("published"):
            continue

        print(f"\n[IG Publisher] Found due post for {post_date}: {item.get('product', {}).get('name')}")
        caption = item.get("caption", "")
        is_reel = "Reel" in item.get("type", "")
        video_url = item.get("video_url")
        image_url = item.get("product", {}).get("image")

        first_comment = "🔗 Direct link to our European conversion guide & atelier collection: https://naturaintimo.com/size-guide/"

        try:
            if is_reel and video_url:
                print(f"[IG Publisher] Publishing REEL from: {video_url}")
                # Step 1: Create Video Container
                c_res = requests.post(
                    f"https://graph.facebook.com/v21.0/{ig_id}/media",
                    headers=headers,
                    json={
                        "media_type": "REELS",
                        "video_url": video_url,
                        "caption": caption
                    }
                )
            else:
                print(f"[IG Publisher] Publishing PHOTO from: {image_url}")
                # Step 1: Create Photo Container
                c_res = requests.post(
                    f"https://graph.facebook.com/v21.0/{ig_id}/media",
                    headers=headers,
                    json={
                        "image_url": image_url,
                        "caption": caption
                    }
                )

            c_data = c_res.json()
            creation_id = c_data.get("id")
            if not creation_id:
                print("[IG Publisher Error] Failed to create container:", c_data)
                continue

            print(f"[IG Publisher] Container {creation_id} created. Waiting for FINISHED status...")
            is_ready = False
            for attempt in range(20):
                time.sleep(4)
                s_res = requests.get(
                    f"https://graph.facebook.com/v21.0/{creation_id}?fields=status_code,status",
                    headers=headers
                )
                st = s_res.json()
                status_code = st.get("status_code")
                print(f"[IG Publisher] Attempt {attempt+1}: {status_code}")
                if status_code == "FINISHED":
                    is_ready = True
                    break
                elif status_code == "ERROR":
                    print("[IG Publisher Error] Media processing error:", st)
                    break

            if not is_ready:
                print("[IG Publisher Error] Container was not ready in time.")
                continue

            # Step 2: Publish Container
            print(f"[IG Publisher] Publishing container {creation_id}...")
            pub_res = requests.post(
                f"https://graph.facebook.com/v21.0/{ig_id}/media_publish",
                headers=headers,
                json={"creation_id": creation_id}
            )
            pub_data = pub_res.json()
            media_id = pub_data.get("id")

            if not media_id:
                print("[IG Publisher Error] Failed to publish:", pub_data)
                continue

            print(f"[IG Publisher] Successfully published on Instagram! Media ID: {media_id}")
            time.sleep(2)

            # Step 3: Post First Comment
            requests.post(
                f"https://graph.facebook.com/v21.0/{media_id}/comments",
                headers=headers,
                json={"message": first_comment}
            )

            # Step 4: Record in tracker
            tracker[post_date] = {
                "published": True,
                "media_id": media_id,
                "type": "REEL" if is_reel else "PHOTO",
                "published_at": datetime.now(timezone.utc).isoformat()
            }
            save_tracker(tracker)
            print(f"[IG Publisher] Successfully recorded {post_date} in tracker.")

        except Exception as e:
            print(f"[IG Publisher Exception] {e}")

if __name__ == "__main__":
    check_and_publish_instagram()
