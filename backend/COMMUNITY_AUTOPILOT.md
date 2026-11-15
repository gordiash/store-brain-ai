# Community Autopilot — FB + IG

Silnik publikacji postów i Reels budujących społeczność wokół europejskiego brafittingu (US/CA/UK/AU).

## Pliki
- `backend/community_queue.json` — kolejka treści (termin UTC, typ, platformy, caption, first_comment).
- `backend/community_tracker.json` — stan publikacji (tworzony automatycznie).
- `backend/community_autopilot.py` — silnik.

## Zasady P0 (wbudowane)
- Brak linków w treści głównej — link trafia do pierwszego komentarza.
- Waluty tylko ISO (`USD 10.00`, `CAD 200`), zakaz `$` przed cyfrą.
- Każdy post ma hook konwersacyjny (pytanie do społeczności).
- Duplikaty blokowane przez tracker.

## Użycie
```bash
# podgląd (nic nie publikuje)
python3 backend/community_autopilot.py --due

# publikacja tego, co już jest due
python3 backend/community_autopilot.py --due --publish

# jeden wpis
python3 backend/community_autopilot.py --id 2026-11-17-fb-ig-01 --publish
```

## Uwagi
- Domyślnie dry-run. `--publish` wysyła realnie na FB/IG.
- Reels wymagają publicznego URL do MP4 (9:16).
- Token: `FB_PAGE_TOKEN` + `FB_PAGE_ID` + `IG_ACCOUNT_ID` z `.env`.
- Harmonogram: OpenBot routine (nie cron), np. codziennie 17:00 Europe/Warsaw.
