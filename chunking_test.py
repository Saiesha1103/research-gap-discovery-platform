import fitz

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

print()

print("NUMBER OF CHUNKS:")

print(len(chunks))

print()

print("FIRST CHUNK:")

print()

print(chunks[0])