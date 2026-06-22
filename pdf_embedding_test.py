import fitz
import chromadb

from sentence_transformers import (
    SentenceTransformer
)

# ------------------
# Load PDF
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

print(
    f"Chunks: {len(chunks)}"
)

# ------------------
# Embedding Model
# ------------------

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

embeddings = model.encode(
    chunks
).tolist()

print(
    "Embeddings Created!"
)

# ------------------
# ChromaDB
# ------------------

client = chromadb.Client()

collection = client.create_collection(
    name="paper_chunks"
)

ids = []

for i in range(
    len(chunks)
):
    ids.append(
        str(i)
    )

collection.add(
    documents=chunks,
    embeddings=embeddings,
    ids=ids
)

print(
    "Stored in ChromaDB!"
)