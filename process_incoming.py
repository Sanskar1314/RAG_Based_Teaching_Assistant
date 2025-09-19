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

def inference(prompt):
    r = requests.post("http://localhost:11434/api/generate",json={
        # "model":"deepseek-r1:8b",
        "model":"llama3.2:3b",
        "prompt":prompt,
        "stream":False
    })
    response = r.json()
    print(response)
    return response

df = joblib.load("embeddings.joblib")  # Load the DataFrame from the file

incoming_query = input("Ask a question:")
question_embedding = create_embeddings([incoming_query])[0]

# print(np.vstack(df['embedding'].values))
# print(np.vstack(df['embedding']).shape)
similarities = cosine_similarity(np.vstack(df['embedding']),[question_embedding]).flatten()
# print(similarities)
top_results = 5
max_indx = similarities.argsort()[::-1][0:top_results]
# print(max_indx)
new_df = df.loc[max_indx]
# print(new_df[["title","number","text"]])

prompt = f"""You are a helpful teaching assistant for the Sigma Web Development course.
Answer the user's question below using ONLY the provided video subtitle chunks.
Guide the user to the relevant videos and timestamps, and explain where they can learn about the topic.
When mentioning timestamps, always convert the time from seconds to standard minute format (e.g., 850 seconds = 14 minutes 10 seconds).
Do NOT repeat the subtitle chunks or say 'according to the provided chunks'.
If the question is unrelated, reply: 'I can only answer questions related to the course.'
If you don't know, reply: 'I don't know.'

User question: "{incoming_query}"

Video subtitle chunks (for your reference only):
{new_df[["title", "number", "start", "end", "text"]].to_json(orient="records")}
"""
with open("prompt.txt","w") as f:
    f.write(prompt)
response = inference(prompt)["response"]
print(response)  # Add this line to see the actual response
with open("response.txt","w") as f:
    f.write(response)
# for index,item in new_df.iterrows():
#     print(index,item["title"],item["number"],item["text"],item["start"],item["end"])