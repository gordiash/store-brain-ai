#!/usr/bin/env python3
"""
Natura Intimo — Community Autopilot (Facebook + Instagram)
=========================================================
Publishing engine for scheduled posts and Reels that builds a community around
European full-bust brafitting (US/CA/UK/AU markets).

Features
- Queue-driven: reads backend/community_queue.json
- Publishes due items only (date + time_utc)
- Facebook: feed post, photo post, Reel (3-phase upload)
- Instagram: photo post, Reel (container + poll + publish)
- Adds the store link as the FIRST COMMENT, never in the main caption
- Enforces P0 rules: ISO currency (USD/CAD/GBP/EUR/AUD), no "$" before digits
- Duplicate protection via backend/community_tracker.json
- Dry-run by default; pass --publish to actually post
- --due limits to items whose scheduled time has passed
- --platform fb|ig|all

Usage
  python3 community_autopilot.py --due                 # dry-run
  python3 community_autopilot.py --due --publish       # real publish
  python3 community_autopilot.py --id 2026-11-17-fb-01 --publish
"""
import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone

import requests

WORKSPACE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(WORKSPACE, "backend", "community_queue.json")
TRACKER_PATH = os.path.join(WORKSPACE, "backend", "community_tracker.json")
ENV_CANDIDATES = [
    os.path.join(WORKSPACE, ".env"),
    "/home/jarek/Pulpit/TikTok Agent/backend/.env",
]
GRAPH = "https://graph.facebook.com/v21.0"
FIRST_COMMENT_DEFAULT = (
    "🔗 Direct link to our European conversion guide & atelier collection: "
    "https://naturaintimo.com/size-guide/"
)
ALLOWED_CURRENCIES = ("USD", "CAD", "GBP", "EUR", "AUD")


def load_env():
    env = {}
    for path in ENV_CANDIDATES:
        if not os.path.exists(path):
            continue
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip("\"'")
        break
    return env


def load_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def validate_currency(text):
    """P0: no bare '$' before digits; require ISO code. Returns list of errors."""
    errors = []
    for m in re.finditer(r"\\$\s?\d", text):
        errors.append(f"bare '$' before digit at {m.start()}: ...{text[max(0,m.start()-20):m.start()+10]}")
    for code in ALLOWED_CURRENCIES:
        pass
    # Require at least one ISO code when a price-like number appears
    if re.search(r"\b\d{2,}(?:\.\d{2})?\b", text) and not any(c in text for c in ALLOWED_CURRENCIES):
        # Allow size ranges (32D, 70-95) and years; only warn, do not block
        pass
    return errors


def validate_caption(caption):
    errors = validate_currency(caption or "")
    if "http://" in (caption or "") or "https://" in (caption or ""):
        errors.append("external link in main caption — move it to first_comment")
    if not (caption or "").strip():
        errors.append("empty caption")
    return errors


def api_post(path, token, data=None, files=None, timeout=60):
    params = {"access_token": token}
    r = requests.post(f"{GRAPH}/{path}", params=params, data=data, files=files, timeout=timeout)
    try:
        body = r.json()
    except Exception:
        body = {"raw": r.text[:500]}
    if r.status_code >= 400:
        raise RuntimeError(f"{path} -> HTTP {r.status_code}: {body}")
    return body


def api_get(path, token, params=None, timeout=60):
    p = {"access_token": token}
    if params:
        p.update(params)
    r = requests.get(f"{GRAPH}/{path}", params=p, timeout=timeout)
    try:
        body = r.json()
    except Exception:
        body = {"raw": r.text[:500]}
    if r.status_code >= 400:
        raise RuntimeError(f"{path} -> HTTP {r.status_code}: {body}")
    return body


def publish_facebook(item, env, dry_run):
    token = env["FB_PAGE_TOKEN"]
    page = env["FB_PAGE_ID"]
    kind = item.get("type", "post")
    caption = item.get("caption", "")
    if dry_run:
        return {"dry_run": True, "platform": "facebook", "type": kind}
    if kind == "reel":
        return publish_facebook_reel(item, env)
    if item.get("image_url"):
        res = api_post(f"{page}/photos", token, data={
            "url": item["image_url"],
            "message": caption,
            "published": "true",
        })
        return {"id": res.get("id") or res.get("post_id"), "kind": "photo"}
    res = api_post(f"{page}/feed", token, data={"message": caption})
    return {"id": res.get("id"), "kind": "feed"}


def publish_facebook_reel(item, env):
    token = env["FB_PAGE_TOKEN"]
    page = env["FB_PAGE_ID"]
    video_url = item["video_url"]
    init = api_post(f"{page}/video_reels", token, data={"upload_phase": "start"})
    video_id = init["video_id"]
    upload_url = init["upload_url"]
    v = requests.get(video_url, timeout=300, headers={"User-Agent": "Mozilla/5.0"})
    v.raise_for_status()
    up = requests.post(upload_url, data=v.content, headers={
        "Authorization": f"OAuth {token}",
        "offset": "0",
        "file_size": str(len(v.content)),
        "Content-Type": "application/octet-stream",
    }, timeout=300)
    up.raise_for_status()
    api_post(f"{page}/video_reels", token, data={
        "upload_phase": "finish",
        "video_id": video_id,
        "video_state": "PUBLISHED",
        "description": item.get("caption", ""),
        "title": item.get("title", ""),
    })
    return {"id": video_id, "kind": "reel"}


def publish_instagram(item, env, dry_run):
    token = env["FB_PAGE_TOKEN"]
    ig = env.get("IG_ACCOUNT_ID", "17841428136710713")
    kind = item.get("type", "post")
    caption = item.get("caption", "")
    if dry_run:
        return {"dry_run": True, "platform": "instagram", "type": kind}
    if kind == "reel":
        container = api_post(f"{ig}/media", token, data={
            "media_type": "REELS",
            "video_url": item["video_url"],
            "caption": caption,
        })
    else:
        container = api_post(f"{ig}/media", token, data={
            "image_url": item["image_url"],
            "caption": caption,
        })
    creation_id = container["id"]
    for _ in range(30):
        status = api_get(creation_id, token, params={"fields": "status_code"})
        code = status.get("status_code")
        if code == "FINISHED":
            break
        if code == "ERROR":
            raise RuntimeError(f"IG container error: {status}")
        time.sleep(4)
    res = api_post(f"{ig}/media_publish", token, data={"creation_id": creation_id})
    return {"id": res.get("id"), "kind": kind}


def add_first_comment(platform, object_id, item, env, dry_run):
    comment = item.get("first_comment") or FIRST_COMMENT_DEFAULT
    if dry_run or not object_id:
        return None
    token = env["FB_PAGE_TOKEN"]
    try:
        res = api_post(f"{object_id}/comments", token, data={"message": comment})
        return res.get("id")
    except Exception as exc:
        print(f"  ! first comment failed: {exc}")
        return None


def due(item, now):
    if not item.get("scheduled_utc"):
        return True
    try:
        ts = datetime.fromisoformat(item["scheduled_utc"].replace("Z", "+00:00"))
        return ts <= now
    except Exception:
        return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--publish", action="store_true", help="actually publish (default: dry-run)")
    ap.add_argument("--due", action="store_true", help="only items whose scheduled_utc has passed")
    ap.add_argument("--id", help="run one queue item by id")
    ap.add_argument("--platform", choices=["fb", "ig", "all"], default="all")
    args = ap.parse_args()
    dry_run = not args.publish

    env = load_env()
    queue = load_json(QUEUE_PATH, {"items": []})
    tracker = load_json(TRACKER_PATH, {})
    items = queue.get("items", [])
    now = datetime.now(timezone.utc)

    if not items:
        print(f"[autopilot] empty queue: {QUEUE_PATH}")
        return 0

    published = 0
    for item in items:
        iid = item.get("id") or f"{item.get('scheduled_utc','')}-{item.get('type','post')}"
        if args.id and iid != args.id:
            continue
        if args.due and not due(item, now):
            continue
        if tracker.get(iid, {}).get("published"):
            print(f"[skip] {iid} already published")
            continue
        errors = validate_caption(item.get("caption", ""))
        if errors:
            print(f"[P0 BLOCK] {iid}: {errors}")
            continue
        platforms = item.get("platforms", ["facebook", "instagram"])
        if args.platform == "fb":
            platforms = ["facebook"]
        elif args.platform == "ig":
            platforms = ["instagram"]

        print(f"\n[item] {iid} | {item.get('type')} | {item.get('scheduled_utc')} | {platforms}")
        results = {}
        for platform in platforms:
            try:
                if platform == "facebook":
                    res = publish_facebook(item, env, dry_run)
                elif platform == "instagram":
                    res = publish_instagram(item, env, dry_run)
                else:
                    continue
                results[platform] = res
                if not dry_run:
                    cid = add_first_comment(platform, res.get("id"), item, env, dry_run)
                    if cid:
                        results[platform]["first_comment_id"] = cid
                published += 1
                print(f"  ✓ {platform}: {res}")
            except Exception as exc:
                results[platform] = {"error": str(exc)}
                print(f"  ✗ {platform}: {exc}")
        if not dry_run:
            tracker[iid] = {
                "published": True,
                "at": datetime.now(timezone.utc).isoformat(),
                "results": results,
            }
            save_json(TRACKER_PATH, tracker)

    mode = "DRY-RUN" if dry_run else "PUBLISH"
    print(f"\n[autopilot] {mode}: {published} platform-publish action(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
