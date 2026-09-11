#!/usr/bin/env python3
"""
Fast, SSL-session-reused re-embedding script for Gemini API.
Uses requests.Session() for keep-alive connections (avoids SSL handshake drops).
BATCH_SIZE = 25 chunks
"""

import json
import os
import glob
import time
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = "gemini-embedding-001"
BATCH_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:batchEmbedContents?key={API_KEY}"
BATCH_SIZE = 25
OUTPUT_PATH = os.path.join("web", "data", "embeddings.json")

session = requests.Session()


def embed_batch(texts, retries=5):
    payload = {
        "requests": [
            {
                "model": f"models/{MODEL}",
                "content": {"parts": [{"text": text}]},
            }
            for text in texts
        ]
    }
    for attempt in range(retries):
        try:
            r = session.post(BATCH_URL, json=payload, timeout=20)
            if r.status_code == 200:
                data = r.json()
                return [e["values"] for e in data["embeddings"]]
            elif r.status_code == 429:
                print(f"    [429 Rate Limit] Waiting 10s...", flush=True)
                time.sleep(10)
            else:
                print(f"    [HTTP {r.status_code}] Retrying in 3s...", flush=True)
                time.sleep(3)
        except Exception as e:
            print(f"    [Network Error: {type(e).__name__}] Retrying in 3s...", flush=True)
            time.sleep(3)
    raise RuntimeError("Failed to embed batch after retries")


def main():
    json_files = sorted(glob.glob("newjsons/*.json"))
    print(f"Found {len(json_files)} JSON files in newjsons/", flush=True)

    records = []
    chunk_id = 0

    for filepath in json_files:
        filename = os.path.basename(filepath)
        parts = filename.replace(".mp3.json", "").split("_", 1)
        number = parts[0]
        title = parts[1] if len(parts) > 1 else filename

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        chunks = data.get("chunks", [])
        for c in chunks:
            records.append({
                "number": number,
                "title": title,
                "start": float(c.get("start", 0)),
                "end": float(c.get("end", 0)),
                "text": str(c.get("text", "")),
                "chunk_id": chunk_id,
            })
            chunk_id += 1

    total = len(records)
    print(f"Loaded {total} total chunks.", flush=True)

    existing_map = {}
    if os.path.exists(OUTPUT_PATH):
        try:
            with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                existing = json.load(f)
                for item in existing:
                    if "embedding" in item and len(item["embedding"]) > 0:
                        existing_map[item["chunk_id"]] = item["embedding"]
            print(f"Found existing partial data with {len(existing_map)}/{total} chunks embedded! Resuming...", flush=True)
        except Exception:
            pass

    total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    for i in range(0, total, BATCH_SIZE):
        batch_chunks = records[i : i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1

        missing = [c for c in batch_chunks if c["chunk_id"] not in existing_map]
        if not missing:
            continue

        batch_texts = [c["text"] for c in missing]
        embeddings = embed_batch(batch_texts)

        for c, emb in zip(missing, embeddings):
            existing_map[c["chunk_id"]] = emb

        pct = (len(existing_map) / total) * 100
        print(f"  [Batch {batch_num}/{total_batches}] {len(existing_map)}/{total} chunks ({pct:.1f}%)", flush=True)

        for r in records:
            if r["chunk_id"] in existing_map:
                r["embedding"] = existing_map[r["chunk_id"]]
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump([r for r in records if "embedding" in r], f)

        time.sleep(2.0)

    for r in records:
        if r["chunk_id"] in existing_map:
            r["embedding"] = existing_map[r["chunk_id"]]
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f)

    file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"\n✓ SUCCESS! Created {OUTPUT_PATH} ({file_size_mb:.1f} MB) with {len(records)} chunks!", flush=True)


if __name__ == "__main__":
    main()
