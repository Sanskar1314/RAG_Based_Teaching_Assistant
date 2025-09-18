import pandas as pd
import joblib   
import os   
import requests
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def create_embeddings(text_list):
    r = requests.post("http://localhost:11434/api/embed",json={
        "model":"bge-m3",
        "input":text_list
    })

    embedding = r.json()['embeddings']
    return embedding

df = joblib.load("embeddings.joblib")  # Load the DataFrame from the file

incoming_query = input("Ask a question:")
question_embedding = create_embeddings([incoming_query])[0]

# print(np.vstack(df['embedding'].values))
# print(np.vstack(df['embedding']).shape)
similarities = cosine_similarity(np.vstack(df['embedding']),[question_embedding]).flatten()
# print(similarities)
top_results = 30
max_indx = similarities.argsort()[::-1][0:top_results]
# print(max_indx)
new_df = df.loc[max_indx]
# print(new_df[["title","number","text"]])

for index,item in new_df.iterrows():
    print(index,item["title"],item["number"],item["text"],item["start"],item["end"])