from sentence_transformers import SentenceTransformer

# Load embedding model
model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# Text
text = "Battery health prediction"

# Convert text → vector
embedding = model.encode(text)

print("Embedding Created!")

print()

print("Vector Length:")

print(len(embedding))

print()

print("First 10 values:")

print(
    embedding[:10]
)