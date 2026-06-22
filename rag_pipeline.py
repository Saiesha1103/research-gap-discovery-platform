import chromadb
import google.generativeai as genai

from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

import os

# -------------------
# Gemini
# -------------------

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model_gemini = genai.GenerativeModel(
    "gemini-2.5-flash"
)

# -------------------
# Embeddings
# -------------------

model_embedding = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# -------------------
# ChromaDB
# -------------------

client = chromadb.Client()

collection = client.create_collection(
    name="research_chunks"
)

chunks = [
    "LSTM is used for battery health prediction.",
    "Transformers improve battery forecasting.",
    "Cats are cute animals."
]

embeddings = model_embedding.encode(
    chunks
).tolist()

collection.add(
    documents=chunks,
    embeddings=embeddings,
    ids=["1", "2", "3"]
)

# -------------------
# User Query
# -------------------

question = "What methods are used for battery prediction?"

query_embedding = model_embedding.encode(
    question
).tolist()

results = collection.query(
    query_embeddings=[query_embedding],
    n_results=2
)

retrieved_chunks = results["documents"][0]

# -------------------
# RAG Prompt
# -------------------

prompt = f"""
Answer the question using ONLY
the provided context.

Context:

{retrieved_chunks}

Question:

{question}
"""

response = model_gemini.generate_content(
    prompt
)

print(response.text)