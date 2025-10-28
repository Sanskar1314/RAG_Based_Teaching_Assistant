from flask import Flask, render_template, request, jsonify
import sys
import os
import json
import requests
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import joblib

# Add parent directory to path to import from parent modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)

def create_embeddings(text_list):
    r = requests.post("http://localhost:11434/api/embed", json={
        "model": "bge-m3",
        "input": text_list
    })
    embedding = r.json()['embeddings']
    return embedding

def inference(prompt):
    r = requests.post("http://localhost:11434/api/generate", json={
        "model": "llama3.2:3b",
        "prompt": prompt,
        "stream": False
    })
    response = r.json()
    return response

@app.route('/')
def index():
    # Check if embeddings file exists and Ollama server is running
    setup_status = check_setup_status()
    return render_template('index.html', setup_status=setup_status)

def check_setup_status():
    """Check if the required files and services are available"""
    status = {
        "ready": True,
        "messages": []
    }
    
    # Check if embeddings file exists
    # First try in the parent directory of UI folder
    embeddings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "embeddings.joblib")
    # If not found, try in the main project directory
    if not os.path.exists(embeddings_path):
        embeddings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "embeddings.joblib")
        if not os.path.exists(embeddings_path):
            status["ready"] = False
            status["messages"].append("Embeddings file (embeddings.joblib) not found. Please run the read_chunks.py script first.")
    
    # Check if Ollama server is running
    try:
        requests.get("http://localhost:11434/api/version", timeout=2)
    except requests.exceptions.RequestException:
        status["ready"] = False
        status["messages"].append("Ollama server is not running. Please start it with 'ollama serve'.")
    
    return status

@app.route('/ask', methods=['POST'])
def ask():
    try:
        # Check setup status
        setup_status = check_setup_status()
        if not setup_status["ready"]:
            return jsonify({"error": "Setup incomplete", "details": setup_status["messages"]})
        
        # Get the embeddings file path
        embeddings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "embeddings.joblib")
        # If not found, try in the main project directory
        if not os.path.exists(embeddings_path):
            embeddings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "embeddings.joblib")
        
        # Load the DataFrame from the file
        df = joblib.load(embeddings_path)
        
        # Get the question from the form
        incoming_query = request.form.get('question', '')
        
        if not incoming_query:
            return jsonify({"error": "Please enter a question"})
        
        # Create embeddings for the question
        try:
            question_embedding = create_embeddings([incoming_query])[0]
        except Exception as e:
            return jsonify({"error": f"Error creating embeddings: {str(e)}"})
        
        # Calculate similarities
        similarities = cosine_similarity(np.vstack(df['embedding']), [question_embedding]).flatten()
        
        # Get top results
        top_results = 5
        max_indx = similarities.argsort()[::-1][0:top_results]
        new_df = df.loc[max_indx]
        
        # Read prompt from prompt.txt file
        prompt_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'prompt.txt')
        
        try:
            with open(prompt_path, 'r') as f:
                prompt_template = f.read()
        except Exception as e:
            return jsonify({"error": f"Error reading prompt file: {str(e)}"})
            
        # Create prompt using the template from prompt.txt
        prompt = f"""{prompt_template}

User question: "{incoming_query}"

Video subtitle chunks (for your reference only):
{new_df[["title", "number", "start", "end", "text"]].to_json(orient="records")}
"""
        
        # Get response from inference
        try:
            response = inference(prompt)["response"]
            return jsonify({"response": response})
        except Exception as e:
            return jsonify({"error": f"Error generating response: {str(e)}"})
    
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5001)