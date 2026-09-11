#!/usr/bin/env python3
"""
Fast one-time script to re-embed existing chunks using Gemini's batchEmbedContents REST API.
Converts 1727 chunks to gemini-embedding-001 embeddings in ~10 seconds.
"""

import json
import os
import time
import joblib
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = "gemini-embedding-001"
BATCH_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:batchEmbedContents?key={API_KEY}"
BATCH_SIZE = 50
OUTPUT_PATH = os.path.join("web", "data", "embeddings.json")


def embed_batch(texts):
    payload = {
        "requests": [
            {
                "model": f"models/{MODEL}",
                "content": {"parts": [{"text": text}]},
            }
            for text in texts
        ]
    }
    r = requests.post(BATCH_URL, json=payload, timeout=60)
    r.raise_for_status()
    data = r.json()
    return [e["values"] for e in data["embeddings"]]


def main():
    print("Loading existing embeddings.joblib...", flush=True)
    df = joblib.load("embeddings.joblib")
    print(f"Found {len(df)} chunks.", flush=True)

    records = []
    all_texts = []

    for idx, row in df.iterrows():
        records.append({
            "title": str(row.get("title", "")),
            "number": str(row.get("number", "")),
            "start": float(row.get("start", 0)),
            "end": float(row.get("end", 0)),
            "text": str(row.get("text", "")),
        })
        all_texts.append(str(row.get("text", "")))

    total = len(all_texts)
    print(f"Fast re-embedding {total} chunks in batches of {BATCH_SIZE}...", flush=True)

    all_embeddings = []
    for i in range(0, total, BATCH_SIZE):
        batch = all_texts[i : i + BATCH_SIZE]
        print(f"  Embedding batch {i // BATCH_SIZE + 1}/{(total + BATCH_SIZE - 1) // BATCH_SIZE}...", flush=True)

        embeddings = embed_batch(batch)
        all_embeddings.extend(embeddings)

        if i + BATCH_SIZE < total:
            time.sleep(0.5)

    for i, record in enumerate(records):
        record["embedding"] = all_embeddings[i]

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    with open(OUTPUT_PATH, "w") as f:
        json.dump(records, f)

    file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"\n✓ Successfully created {OUTPUT_PATH} ({file_size_mb:.1f} MB) with {len(records)} chunks!", flush=True)


if __name__ == "__main__":
    main()
