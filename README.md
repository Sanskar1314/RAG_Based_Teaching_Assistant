# RAG-Based Teaching Assistant

An AI-powered teaching assistant that allows users to interact with educational video content using natural language. Instead of manually searching through long lectures, users can ask questions and get answers based on the relevant sections of the video.

The project uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant information from video transcripts before generating an answer.

## Features

* Convert educational videos into searchable text
* Extract audio from video lectures
* Transcribe lectures using **OpenAI Whisper**
* Split transcripts into smaller timestamped chunks
* Generate semantic embeddings using **BGE-M3**
* Retrieve relevant content using similarity search
* Generate context-aware answers using an LLM
* Simple interactive interface using **Streamlit**
* Backend functionality using **Flask**

## How It Works

The system follows this pipeline:

```text
Educational Video
       ↓
Extract Audio
       ↓
Whisper Speech-to-Text
       ↓
Transcript + Timestamps
       ↓
Text Chunking
       ↓
BGE-M3 Embeddings
       ↓
Vector Storage
       ↓
User Question
       ↓
Similarity Search
       ↓
Relevant Context
       ↓
LLM
       ↓
Generated Answer
```

### 1. Video Processing

The input educational video is processed to extract its audio.

### 2. Speech-to-Text

**OpenAI Whisper** converts the audio into text while retaining timestamp information.

### 3. Chunking

The transcript is divided into smaller chunks. Timestamps are retained so that relevant sections of the original lecture can be identified.

### 4. Embedding Generation

Each text chunk is converted into a vector representation using **BGE-M3**, accessed locally through **Ollama**.

### 5. Retrieval

When a user asks a question, the question is converted into an embedding and compared with the stored embeddings using similarity search.

The most relevant chunks are selected as context.

### 6. Response Generation

The retrieved context is provided to the language model along with the user's question. The model then generates an answer based on the retrieved information.

## Tech Stack

| Component            | Technology        |
| -------------------- | ----------------- |
| Programming Language | Python            |
| Speech-to-Text       | OpenAI Whisper    |
| Embeddings           | BGE-M3            |
| Local Model Runtime  | Ollama            |
| Similarity Search    | Cosine Similarity |
| Backend              | Flask             |
| Frontend             | Streamlit         |
| Data Processing      | NumPy, Pandas     |
| Storage              | Joblib / Pickle   |

## Project Structure

```text
RAG_Based_Teaching_Assistant/
│
├── app/
│   ├── ...
│
├── notebooks/
│   └── ...
│
├── data/
│   └── ...
│
├── embeddings.joblib
├── requirements.txt
├── README.md
└── ...
```

> The exact structure may vary depending on the current version of the project.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/RAG_Based_Teaching_Assistant.git
cd RAG_Based_Teaching_Assistant
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:

**macOS / Linux**

```bash
source venv/bin/activate
```

**Windows**

```bash
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Install Ollama

Install Ollama and make sure it is running locally.

Then pull the embedding model:

```bash
ollama pull bge-m3
```

## Running the Project

Start the backend:

```bash
python app.py
```

Then start the Streamlit interface:

```bash
streamlit run streamlit_app.py
```

Open the local Streamlit URL shown in the terminal.

## Example Use Case

A student watches a two-hour machine learning lecture and wants to understand a specific concept.

Instead of searching through the entire lecture, the student can ask:

> "What is the difference between overfitting and underfitting?"

The system searches the transcript, retrieves the most relevant section of the lecture, and uses that context to generate an answer.

## Hardware Used

The project was developed and tested on:

* **Operating System:** macOS
* **CPU:** Apple M3, 8-core CPU
* **RAM:** 16 GB Unified Memory
* **GPU:** Integrated Apple M3 GPU
* **Memory Architecture:** Unified memory shared between CPU and GPU

## My Contribution

I personally worked on the core RAG pipeline, including:

* Video/audio preprocessing
* Speech-to-text processing using Whisper
* Transcript chunking and timestamp handling
* Embedding generation using BGE-M3
* Similarity-based retrieval
* Context preparation for the LLM
* Backend implementation
* Streamlit-based user interface
* Connecting the different components into an end-to-end application

## Limitations

The current system is primarily designed for educational video content and depends on the quality of the transcript and retrieved context.

Some possible failure cases include:

* Poor audio quality resulting in inaccurate transcription
* Relevant information not being retrieved
* Ambiguous questions
* Conflicting information in the source material
* LLM-generated responses that may not perfectly reflect the retrieved context

## Future Improvements

Some improvements I would make include:

* Using a dedicated vector database such as FAISS, Chroma, or Pinecone
* Improving chunking and retrieval strategies
* Adding source citations with video timestamps
* Supporting multiple videos and courses
* Adding conversation memory
* Improving evaluation using a dedicated RAG evaluation dataset
* Adding authentication and cloud deployment
* Adding reranking to improve retrieval quality

## What I Learned

This project helped me understand how an end-to-end RAG application is built beyond simply calling an LLM API. I worked with the complete pipeline from **unstructured video data → transcription → embeddings → retrieval → context → generated response**, and learned how the quality of retrieval directly affects the quality of the final answer.

## License

This project is intended for educational and portfolio purposes.
