
FROM python:3.11-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim

WORKDIR /app


COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin


COPY . .


EXPOSE 8501 5001


ENV PYTHONUNBUFFERED=1

ENV OLLAMA_HOST=http://host.docker.internal:11434


RUN mkdir -p /root/.streamlit && \
    echo '[server]\n\
headless = true\n\
port = 8501\n\
address = "0.0.0.0"\n\
enableCORS = false\n\
enableXsrfProtection = false\n' > /root/.streamlit/config.toml


CMD ["streamlit", "run", "ui/streamlit/app.py", "--server.port=8501", "--server.address=0.0.0.0"]
