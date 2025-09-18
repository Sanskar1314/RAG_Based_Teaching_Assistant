import requests
import os
import json
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import joblib
def create_embeddings(text_list):
    r = requests.post("http://localhost:11434/api/embed",json={
        "model":"bge-m3",
        "input":text_list
    })

    embedding = r.json()['embeddings']
    return embedding

jsons = os.listdir("jsons")  # List all JSON files in the "jsons" directory
my_dicts =[]
chunk_id = 0

for json_file in jsons:
    with open(f"jsons/{json_file}") as f:
        content = json.load(f)
    print(f"Create embeddings for {json_file}")
    embeddings = create_embeddings([c['text'] for c in content['chunks']])
    for i,chunk in enumerate(content['chunks']):
        chunk['chunk_id'] = chunk_id
        chunk['embedding'] = embeddings[i]
        chunk_id += 1
        my_dicts.append(chunk)
    break

df = pd.DataFrame.from_records(my_dicts)
# Save the DataFrame to a file using joblib for later use   
joblib.dump(df,"embeddings.joblib")
