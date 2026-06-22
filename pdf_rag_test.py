import fitz
import chromadb
import google.generativeai as genai

from sentence_transformers import (
    SentenceTransformer
)

from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model_gemini = genai.GenerativeModel(
    "gemini-2.5-flash"
)

# ------------------
# PDF
# ------------------

pdf = fitz.open(
    "papers/paper.pdf"
)

text = ""

for page in pdf:

    text += page.get_text()

# ------------------
# Chunking
# ------------------

chunk_size = 1000

chunks = []

for i in range(
    0,
    len(text),
    chunk_size
):
    chunks.append(
        text[i:i + chunk_size]
    )

# ------------------
# Embeddings
# ------------------

model_embedding = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

embeddings = model_embedding.encode(
    chunks
).tolist()

# ------------------
# ChromaDB
# ------------------

client = chromadb.Client()

collection = client.create_collection(
    name="paper_chunks"
)

ids = [str(i) for i in range(len(chunks))]

collection.add(
    documents=chunks,
    embeddings=embeddings,
    ids=ids
)

# ------------------
# Question
# ------------------

question = """
What are the main limitations
of this research?
"""

query_embedding = model_embedding.encode(
    question
).tolist()

results = collection.query(
    query_embeddings=[
        query_embedding
    ],
    n_results=3
)

context = "\n\n".join(
    results["documents"][0]
)

# ------------------
# Gemini
# ------------------

prompt = f"""
Answer ONLY using the context.

Context:

{context}

Question:

{question}
"""

response = model_gemini.generate_content(
    prompt
)

print()

print("ANSWER")

print()

print(response.text)