import requests
import os
import json
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
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
# print(df)
incoming_query = input("Ask a question:")
question_embedding = create_embeddings([incoming_query])[0]

# print(np.vstack(df['embedding'].values))
# print(np.vstack(df['embedding']).shape)
similarities = cosine_similarity(np.vstack(df['embedding']),[question_embedding]).flatten()
print(similarities)
top_results = 3
max_indx = similarities.argsort()[::-1][0:top_results]
print(max_indx)
new_df = df.loc[max_indx]
print(new_df[["title","number","text"]])