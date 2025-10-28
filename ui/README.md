# Web Development Course Assistant UI

This folder contains two user interface options for the RAG-based Teaching Assistant:

1. **Flask Interface** - A web-based interface using Flask
2. **Streamlit Interface** - An interactive dashboard using Streamlit

Both interfaces provide the same core functionality but with different user experiences.

## Prerequisites

Before using either interface, make sure:

1. You have already processed your audio files and generated embeddings using the main project scripts
2. The Ollama server is running locally on port 11434
3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Using the Flask Interface

To start the Flask web interface:

1. Navigate to the flask directory:
   ```bash
   cd flask
   ```

2. Run the Flask application:
   ```bash
   python app.py
   ```

3. Open your browser and go to: http://127.0.0.1:5000

### Error Handling

The Flask interface includes built-in error detection that will:

- Check if the `embeddings.joblib` file exists
- Verify if the Ollama server is running
- Display user-friendly error messages with setup instructions when needed

## Using the Streamlit Interface

To start the Streamlit dashboard:

1. Navigate to the streamlit directory:
   ```bash
   cd streamlit
   ```

2. Run the Streamlit application:
   ```bash
   streamlit run app.py
   ```

3. Your browser should automatically open to the Streamlit interface, or you can visit: http://localhost:8501

## Features

Both interfaces allow you to:

- Ask questions about web development topics covered in the course
- Get answers based on the course content with relevant video references
- See which videos and timestamps contain the information you need

## Troubleshooting

If you encounter any issues:

1. Make sure the embeddings.joblib file exists in the parent directory
2. Verify that Ollama is running with the required models (bge-m3 and llama3.2:3b)
3. Check that all dependencies are installed correctly