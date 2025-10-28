#!/usr/bin/env python3
import pandas as pd
import joblib   
import os   
import requests
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai


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
    return 

def inference_gemini(prompt):
    try:
        # Configure the API key
        genai.configure(api_key='AIzaSyDzpuOwbufXp94NnFTi1KBqRl6RTkm0xcg')
        # Use gemini-pro model
        model = genai.GenerativeModel('gemini-pro')
        # Generate response
        response = model.generate_content(prompt)  # Removed 'prompt=' keyword
        return response.text
    except Exception as e:
        print(f"Error generating response with Gemini: {e}")
        return None

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

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:

1. NEVER start your response with phrases like "Based on the video subtitle chunks" or any reference to chunks
2. NEVER mention "chunks", "subtitle chunks", or "provided information" in your response
3. TIMESTAMP FORMAT: Convert ALL seconds to MM:SS format (e.g., 850 seconds = 14:10)
   - INCORRECT: 1028:00, 1467:02 (these are not valid time formats)
   - CORRECT: 17:08, 24:27 (minutes:seconds)
4. ALWAYS include at least 2-3 specific video references in format "Video #X at MM:SS"
5. NEVER exceed 59 in the seconds position (use proper minute:second conversion)

HANDLING SUBJECTIVE QUESTIONS:
- For questions about course quality, benefits, or why it's good:
  - Provide a direct answer based on what the course actually offers
  - Mention specific topics covered and teaching approach
  - Include relevant timestamps where course benefits are discussed
  - If no explicit mentions exist, focus on the course content and structure

EXAMPLE CORRECT RESPONSES:
"CSS is taught in Video #14 at 04:17 where it explains the basics. You can also learn about CSS selectors in Video #17 at 08:25."

"This course is beneficial because it provides comprehensive coverage of web development fundamentals. In Video #01 at 03:45, the instructor explains the structured learning path from HTML to JavaScript. Video #14 at 02:30 demonstrates the hands-on approach with practical examples that help reinforce concepts."

If the question is unrelated, reply: 'I can only answer questions related to the course.'
If you don't know, reply: 'I don't know.'

User question: "{incoming_query}"

Video subtitle chunks (for your reference only):
{new_df[["title", "number", "start", "end", "text"]].to_json(orient="records")}
"""
with open("prompt.txt","w") as f:
    f.write(prompt)
# response = inference(prompt)["response"]
# print(response)  # Add this line to see the actual response

response = inference_gemini(prompt)

with open("response.txt","w") as f:
    f.write(response)
# for index,item in new_df.iterrows():
#     print(index,item["title"],item["number"],item["text"],item["start"],item["end"])