#!/usr/bin/env python3
"""
suno_to_youtube.py
------------------
Fetches completed songs from a local suno-api instance, downloads each MP3,
renders a static video with FFmpeg, and uploads to YouTube via the Data API v3.

Prerequisites
-------------
  pip install requests google-api-python-client google-auth-httplib2 google-auth-oauthlib
  ffmpeg installed and on PATH

Environment / files expected
-----------------------------
  SUNO_API_URL   : base URL of suno-api container  (default: http://localhost:8000)
  CLIENT_SECRETS : path to OAuth2 client_secret*.json from Google Cloud Console
                   (default: ~/client_secret.json)
  TOKEN_FILE     : where the authorized token is cached (default: ~/youtube_token.json)

Usage
-----
  python3 suno_to_youtube.py [--dry-run]
  --dry-run  Download + render videos but skip the YouTube upload step.
"""

import argparse
import csv
import datetime
import json
import logging
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

import requests

SUNO_API_URL   = os.getenv("SUNO_API_URL", "http://localhost:8000")
DOWNLOAD_DIR   = Path("~/suno_downloads").expanduser()
LOG_FILE       = Path("~/suno_youtube_log.csv").expanduser()
BLACK_BG       = Path("/tmp/black.jpg")
CLIENT_SECRETS = Path(os.getenv("CLIENT_SECRETS", "~/client_secret.json")).expanduser()
TOKEN_FILE     = Path(os.getenv("TOKEN_FILE", "~/youtube_token.json")).expanduser()
SCOPES         = ["https://www.googleapis.com/auth/youtube.upload"]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def ensure_black_bg():
    if BLACK_BG.exists():
        return
    log.info("Creating black background image at %s", BLACK_BG)
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi",
         "-i", "color=c=black:s=1920x1080:d=1",
         "-frames:v", "1", str(BLACK_BG)],
        check=True, capture_output=True,
    )


def already_logged(suno_id: str) -> bool:
    if not LOG_FILE.exists():
        return False
    with LOG_FILE.open() as f:
        return any(row[0].strip() == suno_id for row in csv.reader(f))


def append_log(suno_id: str, title: str, yt_id: str):
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", newline="") as f:
        csv.writer(f).writerow([
            suno_id, title, yt_id,
            datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        ])


def safe_filename(name: str) -> str:
    return re.sub(r'[<>:"/\\|?*]', "_", name).strip()


# ---------------------------------------------------------------------------
# Step 1 + 2: Fetch and filter songs
# ---------------------------------------------------------------------------

def fetch_songs() -> list[dict]:
    log.info("GET %s/api/songs", SUNO_API_URL)
    resp = requests.get(f"{SUNO_API_URL}/api/songs", timeout=30)
    resp.raise_for_status()
    songs = resp.json()
    log.info("Total songs returned: %d", len(songs))
    return songs


def filter_new_songs(songs: list[dict]) -> list[dict]:
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    new = []
    for s in songs:
        if s.get("status") != "complete":
            continue
        sid = s.get("id", "")
        if not sid:
            continue
        if already_logged(sid):
            log.info("SKIP (already uploaded): %s  %s", sid, s.get("title", ""))
            continue
        mp3_path = DOWNLOAD_DIR / f"{sid}.mp3"
        if mp3_path.exists():
            log.info("SKIP (MP3 exists, not yet logged — will re-process): %s", sid)
        new.append(s)
    log.info("New songs to process: %d", len(new))
    return new


# ---------------------------------------------------------------------------
# Step 3b: Download MP3
# ---------------------------------------------------------------------------

def download_mp3(song: dict) -> Path:
    sid   = song["id"]
    url   = song["audio_url"]
    dest  = DOWNLOAD_DIR / f"{sid}.mp3"
    if dest.exists():
        log.info("MP3 already on disk: %s", dest)
        return dest
    log.info("Downloading MP3: %s -> %s", url, dest)
    with requests.get(url, stream=True, timeout=120) as r:
        r.raise_for_status()
        with dest.open("wb") as f:
            for chunk in r.iter_content(chunk_size=65536):
                f.write(chunk)
    log.info("Downloaded %.1f MB", dest.stat().st_size / 1_048_576)
    return dest


# ---------------------------------------------------------------------------
# Step 3c: Render video with FFmpeg
# ---------------------------------------------------------------------------

def render_video(song: dict, mp3_path: Path) -> Path:
    sid   = song["id"]
    title = song.get("title", sid)
    mp4   = DOWNLOAD_DIR / f"{sid}.mp4"

    # Escape characters that break FFmpeg's drawtext filter
    escaped = title.replace("'", "\\'").replace(":", "\\:").replace("\\", "\\\\")

    drawtext = (
        f"drawtext=text='{escaped}'"
        ":fontcolor=white:fontsize=48"
        ":x=(w-text_w)/2:y=(h-text_h)/2"
    )
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", str(BLACK_BG),
        "-i", str(mp3_path),
        "-c:v", "libx264", "-tune", "stillimage",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-vf", drawtext,
        "-shortest",
        str(mp4),
    ]
    log.info("Rendering video: %s", mp4.name)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg failed:\n{result.stderr[-2000:]}")
    log.info("Rendered %.1f MB", mp4.stat().st_size / 1_048_576)
    return mp4


# ---------------------------------------------------------------------------
# Step 3d: Build YouTube metadata
# ---------------------------------------------------------------------------

def build_metadata(song: dict) -> dict:
    title       = song.get("title", "Untitled")[:100]
    prompt      = song.get("prompt", "")
    tags_raw    = song.get("tags", "")

    # Combine Suno tags with generic AI music tags
    extra_tags  = ["AI music", "Suno AI", "AI generated music", "instrumental"]
    suno_tags   = [t.strip() for t in tags_raw.split(",") if t.strip()] if tags_raw else []
    all_tags    = list(dict.fromkeys(suno_tags + extra_tags))[:500]  # API limit

    footer      = "\n\nGenerated with Suno AI"
    description = (prompt + footer)[:5000]

    return {
        "snippet": {
            "title":       title,
            "description": description,
            "tags":        all_tags,
            "categoryId":  "10",  # Music
        },
        "status": {
            "privacyStatus": "public",
        },
    }


# ---------------------------------------------------------------------------
# Step 3e: Upload to YouTube
# ---------------------------------------------------------------------------

def get_youtube_service():
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CLIENT_SECRETS.exists():
                raise FileNotFoundError(
                    f"OAuth client secrets not found at {CLIENT_SECRETS}. "
                    "Download from Google Cloud Console → APIs & Services → Credentials."
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_FILE.write_text(creds.to_json())

    return build("youtube", "v3", credentials=creds)


def upload_to_youtube(youtube, mp4_path: Path, metadata: dict) -> str:
    from googleapiclient.http import MediaFileUpload

    log.info("Uploading to YouTube: %s", mp4_path.name)
    media = MediaFileUpload(str(mp4_path), mimetype="video/mp4", resumable=True)
    request = youtube.videos().insert(
        part="snippet,status",
        body=metadata,
        media_body=media,
    )
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            log.info("  Upload progress: %d%%", int(status.progress() * 100))

    yt_id  = response["id"]
    yt_url = f"https://www.youtube.com/watch?v={yt_id}"
    log.info("Uploaded: %s  ->  %s", metadata["snippet"]["title"], yt_url)
    return yt_id


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true",
                        help="Download + render but skip YouTube upload")
    args = parser.parse_args()

    ensure_black_bg()

    try:
        songs = fetch_songs()
    except Exception as exc:
        log.error("Cannot reach suno-api: %s", exc)
        sys.exit(1)

    new_songs = filter_new_songs(songs)
    if not new_songs:
        log.info("Nothing to do.")
        return

    youtube = None
    if not args.dry_run:
        try:
            youtube = get_youtube_service()
        except Exception as exc:
            log.error("YouTube auth failed: %s", exc)
            sys.exit(1)

    uploaded = []
    errors   = []

    for song in new_songs:
        sid   = song.get("id", "?")
        title = song.get("title", sid)
        log.info("--- Processing: %s (%s)", title, sid)
        try:
            mp3  = download_mp3(song)
            mp4  = render_video(song, mp3)
            meta = build_metadata(song)

            if args.dry_run:
                log.info("DRY RUN — skipping upload for: %s", title)
                yt_id = "DRY_RUN"
            else:
                yt_id = upload_to_youtube(youtube, mp4, meta)

            append_log(sid, title, yt_id)
            yt_url = f"https://www.youtube.com/watch?v={yt_id}"
            uploaded.append({"title": title, "yt_id": yt_id, "url": yt_url})

        except Exception as exc:
            log.error("FAILED [%s] %s: %s", sid, title, exc)
            errors.append({"id": sid, "title": title, "error": str(exc)})

    # Summary
    print("\n" + "=" * 60)
    print(f"SUMMARY: {len(uploaded)} uploaded, {len(errors)} failed")
    print("=" * 60)
    for u in uploaded:
        print(f"  ✓  {u['title']}")
        print(f"     {u['url']}")
    for e in errors:
        print(f"  ✗  [{e['id']}] {e['title']}: {e['error']}")
    print(f"\nLog: {LOG_FILE}")


if __name__ == "__main__":
    main()
