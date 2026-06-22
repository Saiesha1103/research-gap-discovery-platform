import fitz
import chromadb

from sentence_transformers import (
    SentenceTransformer
)

model_embedding = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

client = chromadb.Client()

collection = client.create_collection(
    name="paper_chunks"
)

def load_pdf_to_chroma(pdf_path):
    global collection

    try:
        client.delete_collection("paper_chunks")
    except:
        pass

    collection = client.create_collection(
        name="paper_chunks"
    )

    print("STEP 1 - Function Started")

    pdf = fitz.open(
        pdf_path
    )

    print("STEP 2 - PDF Opened")

    text = ""

    for page in pdf:

        text += page.get_text()

    print("STEP 3 - Text Extracted")

    chunks = []

    chunk_size = 1000

    for i in range(
        0,
        len(text),
        chunk_size
    ):

        chunks.append(
            text[i:i + chunk_size]
        )

    print("STEP 4 - Chunks Created")

    embeddings = model_embedding.encode(
        chunks
    ).tolist()

    print("STEP 5 - Embeddings Created")

    ids = []

    for i in range(len(chunks)):

        ids.append(str(i))

    print("STEP 6 - IDs Created")

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids
    )

    print("STEP 7 - Added To Chroma")

def retrieve_context(question):

    query_embedding = model_embedding.encode(
        question
    ).tolist()

    results = collection.query(
        query_embeddings=[
            query_embedding
        ],
        n_results=3
    )

    return "\n\n".join(
        results["documents"][0]
    )