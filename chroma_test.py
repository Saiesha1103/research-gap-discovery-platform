import chromadb
from sentence_transformers import SentenceTransformer

# Load model
model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# Create DB
client = chromadb.Client()

collection = client.create_collection(
    name="research_chunks"
)

# Documents
chunks = [
    "LSTM is used for battery health prediction.",
    "Transformers improve battery forecasting.",
    "Cats are cute animals."
]

# Convert chunks → embeddings
embeddings = model.encode(
    chunks
).tolist()

# Store
collection.add(
    documents=chunks,
    embeddings=embeddings,
    ids=["1", "2", "3"]
)

print("Stored!")

# ---------------------
# Query
# ---------------------

query = "battery prediction"

query_embedding = model.encode(
    query
).tolist()

results = collection.query(
    query_embeddings=[
        query_embedding
    ],
    n_results=10
)

print()

print("Retrieved:")

print(
    results["documents"]
)