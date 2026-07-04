import arxiv
import chromadb

from sentence_transformers import SentenceTransformer

import google.generativeai as genai

from dotenv import load_dotenv

import os
def search_papers(topic):

    search = arxiv.Search(
        query=topic,
        max_results=5,
        sort_by=arxiv.SortCriterion.Relevance
    )

    client = arxiv.Client()

    papers = []

    for result in client.results(search):
        papers.append(
            {
                "title": result.title,
                "summary": result.summary,
                "published": str(result.published),
                "authors": [author.name for author in result.authors],
                "pdf_url": result.pdf_url
            }
        )

    return papers
load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model_gemini = genai.GenerativeModel(
    "gemini-2.5-flash"
)
model_embedding = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

client = chromadb.Client()

collection = client.create_collection(
    name="research_papers"
)
papers = search_papers(
    "Battery Health Prediction"
)
documents = []

for paper in papers:

    documents.append(
        paper["summary"]
    )

embeddings = model_embedding.encode(
    documents
).tolist()

ids = []

for i in range(len(documents)):
    ids.append(str(i))

collection.add(
    documents=documents,
    embeddings=embeddings,
    ids=ids
)
question = """
What methods are commonly used
for battery health prediction?
"""
query_embedding = model_embedding.encode(
    question
).tolist()

results = collection.query(
    query_embeddings=[
        query_embedding
    ],
    n_results=10
)

context = results["documents"][0]
print("\nRetrieved Context:\n")
print(context)

print("\n-------------------\n")
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

print(response.text)
