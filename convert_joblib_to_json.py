#!/usr/bin/env python3
"""
Convert existing embeddings.joblib into web/data/embeddings.json instantly.
Preserves all 1,727 chunks and metadata.
"""

import json
import os
import numpy as np
import joblib

df = joblib.load("embeddings.joblib")
print(f"Loaded {len(df)} rows from embeddings.joblib. Columns: {list(df.columns)}")

records = []
for idx, row in df.iterrows():
    emb = row.get("embedding")
    if isinstance(emb, np.ndarray):
        emb = emb.tolist()
    elif not isinstance(emb, list):
        emb = []

    records.append({
        "chunk_id": int(row.get("chunk_id", idx)),
        "number": str(row.get("number", "")),
        "title": str(row.get("title", "")),
        "start": float(row.get("start", 0)),
        "end": float(row.get("end", 0)),
        "text": str(row.get("text", "")),
        "embedding": emb,
    })

os.makedirs("web/data", exist_ok=True)
output_path = "web/data/embeddings.json"

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(records, f)

file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
print(f"✓ Instant conversion complete! Saved {len(records)} chunks ({file_size_mb:.1f} MB) to {output_path}")
