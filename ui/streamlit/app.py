import streamlit as st
import sys
import os
import json
import requests
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import joblib

# Add parent directory to path to import from parent modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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

def main():
    st.set_page_config(
        page_title="Web Development Course Assistant",
        page_icon="🧑‍💻",
        layout="wide",
        initial_sidebar_state="collapsed"
    )
    
    # Custom CSS for modern UI
    st.markdown("""
    <style>
    /* Completely remove all borders and set dark background */
    .stApp {
        background: #1a1a1a !important;
    }
    
    .main .block-container {
        padding: 0 !important;
        max-width: 100% !important;
        margin: 0 !important;
    }
    
    /* Remove all borders from Streamlit elements */
    .stApp > div {
        border: none !important;
        box-shadow: none !important;
    }
    
    /* Remove white background from main container */
    .main {
        background: transparent !important;
    }
    
    /* Remove borders from all Streamlit components */
    .stApp > div > div {
        border: none !important;
        background: transparent !important;
    }
    
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 15px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .main-header h1 {
        color: white;
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .main-header p {
        color: rgba(255,255,255,0.9);
        font-size: 1.1rem;
        margin: 0.5rem 0 0 0;
    }
    
    .question-container {
        background: transparent;
        padding: 2rem;
        border-radius: 0;
        box-shadow: none;
        margin-bottom: 2rem;
        border: none;
        color: white;
    }
    
    .answer-container {
        background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        margin-top: 1rem;
        border-left: 5px solid #667eea;
        color: white;
    }
    
    .source-videos {
        background: #2d2d2d;
        padding: 1.5rem;
        border-radius: 10px;
        margin-top: 1rem;
        border: 1px solid #404040;
        color: white;
    }
    
    .stButton > button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 25px;
        padding: 0.75rem 2rem;
        font-size: 1.1rem;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
        width: 100%;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }
    
    .stTextArea > div > div > textarea {
        border-radius: 10px;
        border: 2px solid #404040;
        font-size: 1rem;
        padding: 1rem;
        transition: border-color 0.3s ease;
        background: #1a1a1a;
        color: white;
    }
    
    .stTextArea > div > div > textarea:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        background: #1a1a1a;
        color: white;
    }
    
    .stTextArea > div > div > textarea::placeholder {
        color: #888;
    }
    
    .spinner-container {
        text-align: center;
        padding: 2rem;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>🚀 Web Development Course Assistant</h1>
        <p>Get instant answers from the Sigma Web Development course with AI-powered search</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Main content container
    with st.container():
        st.markdown('<div class="question-container">', unsafe_allow_html=True)
        
        st.markdown("### 💬 Ask Your Question")
        user_question = st.text_area(
            "What would you like to know about web development?", 
            height=120, 
            placeholder="e.g., How do I create a responsive table in HTML? What are CSS flexbox properties? How do I add JavaScript to my website?",
            help="Ask any question about HTML, CSS, JavaScript, or web development concepts covered in the course."
        )
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Button to submit question
    if st.button("🔍 Get AI Answer", type="primary"):
        if not user_question:
            st.error("Please enter a question")
        else:
            with st.spinner("Searching through course materials..."):
                try:
                    # Get the embeddings file path
                    embeddings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "embeddings.joblib")
                    
                    # Load the DataFrame from the file
                    df = joblib.load(embeddings_path)
                    
                    # Create embeddings for the question
                    question_embedding = create_embeddings([user_question])[0]
                    
                    # Calculate similarities
                    similarities = cosine_similarity(np.vstack(df['embedding']), [question_embedding]).flatten()
                    
                    # Get top results
                    top_results = 5
                    max_indx = similarities.argsort()[::-1][0:top_results]
                    new_df = df.loc[max_indx]
                    
                    # Create prompt
                    prompt = f"""You are a helpful teaching assistant for the Sigma Web Development course.
Answer the user's question below using ONLY the provided video subtitle chunks.
Guide the user to the relevant videos and timestamps, and explain where they can learn about the topic.
When mentioning timestamps, always convert the time from seconds to standard minute format (e.g., 850 seconds = 14 minutes 10 seconds).
Do NOT repeat the subtitle chunks or say 'according to the provided chunks'.
If the question is unrelated, reply: 'I can only answer questions related to the course.'
If you don't know, reply: 'I don't know.'

User question: "{user_question}"

Video subtitle chunks (for your reference only):
{new_df[["title", "number", "start", "end", "text"]].to_json(orient="records")}
"""
                    
                    # Get response from inference
                    response = inference(prompt)["response"]
                    
                    # Display response in a modern container
                    st.markdown("""
                    <div class="answer-container">
                        <h3 style="color: #667eea; margin-top: 0; display: flex; align-items: center;">
                            🤖 AI Answer
                        </h3>
                        <div style="color: white; font-size: 16px; line-height: 1.7; margin-top: 1rem;">
                            {response}
                        </div>
                    </div>
                    """.format(response=response), unsafe_allow_html=True)
                    
                    # Show source videos in a modern expander
                    with st.expander("📚 Source Videos & Timestamps", expanded=False):
                        st.markdown('<div class="source-videos">', unsafe_allow_html=True)
                        st.markdown("**📖 References from the course:**")
                        for _, row in new_df.iterrows():
                            minutes = int(row['start'] // 60)
                            seconds = int(row['start'] % 60)
                            st.markdown(f"""
                            <div style="background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                                <strong>🎥 Video {row['number']}: {row['title']}</strong><br>
                                <span style="color: #667eea; font-weight: 600;">⏰ Timestamp: {minutes}:{seconds:02d}</span>
                            </div>
                            """, unsafe_allow_html=True)
                        st.markdown('</div>', unsafe_allow_html=True)
                    
                except Exception as e:
                    st.error(f"Error: {str(e)}")

if __name__ == "__main__":
    main()