
from dotenv import load_dotenv
import os
load_dotenv()
from langgraph_v4 import (
    ask_llm,
    run_research_pipeline,
    run_pdf_pipeline
)
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import arxiv

cache = {}
from fastapi.middleware.cors import CORSMiddleware
from rag_utils import load_pdf_to_chroma
# ---------------------------
# FastAPI App
# ---------------------------

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ---------------------------
# Request Model
# ---------------------------

class TopicRequest(BaseModel):
    topic: str

# ---------------------------
# Home Route
# ---------------------------
@app.get("/")
def home():
    return {
        "message": "Research Gap Discovery Platform"
    }

# ---------------------------
# Search Papers from arXiv
# ---------------------------

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

# ---------------------------
# Gemini Paper Analysis
# ---------------------------

def analyze_paper(abstract):

    prompt = f"""
Analyze this research paper abstract.

Return:

1. Research Question
2. Methodology
3. Key Findings
4. Limitations

Abstract:
{abstract}
"""
    return ask_llm(prompt)

# ---------------------------
# Gemini Test Endpoint
# ---------------------------

@app.get("/test-gemini")
def test_gemini():

    result = analyze_paper(
        """
        Battery health prediction is important
        for electric vehicles.
        LSTM networks were used.
        Results showed 95% accuracy.
        """
    )

    return {
        "analysis": result
    }

# ---------------------------
# Search Endpoint
# ---------------------------

@app.post("/search")
def search(request: TopicRequest):

    papers = search_papers(request.topic)

    return {
        "topic": request.topic,
        "papers": papers
    }
@app.post("/analyze")
def analyze(request: TopicRequest):

    papers = search_papers(request.topic)

    first_paper = papers[0]

    analysis = analyze_paper(
        first_paper["summary"]
    )

    return {
        "title": first_paper["title"],
        "analysis": analysis
    }
@app.post("/analyze-all")
def analyze_all(request: TopicRequest):

    papers = search_papers(request.topic)

    analyzed_papers = []

    for paper in papers:

        analysis = analyze_paper(
            paper["summary"]
        )

        analyzed_papers.append(
            {
                "title": paper["title"],
                "analysis": analysis
            }
        )

    return {
        "topic": request.topic,
        "papers": analyzed_papers
    }
def generate_literature_review(analyses):

    prompt = f"""
    You are a research assistant.

    Based on the following paper analyses,
    generate a structured literature review.

    Include:

    1. Introduction
    2. Major Research Themes
    3. Common Methodologies
    4. Key Findings
    5. Research Limitations
    6. Conclusion

    Analyses:

    {analyses}
    """

    return ask_llm(prompt)
@app.post("/literature-review")
def literature_review(request: TopicRequest):

    papers = search_papers(request.topic)

    analyses = []

    for paper in papers:

        analysis = analyze_paper(
            paper["summary"]
        )

        analyses.append(
            {
                "title": paper["title"],
                "analysis": analysis
            }
        )

    review = generate_literature_review(
        analyses
    )

    return {
        "topic": request.topic,
        "literature_review": review
    }
@app.post("/research")
def research(request: TopicRequest):

    topic = request.topic.lower()

    if topic in cache:

        return {
            "status": "success",
            "cached": True,
            "topic": request.topic,
            "results": cache[topic]
        }

    result = run_research_pipeline(
        request.topic
    )

    response_data = {

        "synthesis":
            result["synthesis"],

        "contradictions":
            result["contradictions"],

        "gaps":
            result["gaps"],

        "report":
            result["report"]
    }

    cache[topic] = response_data

    return {

        "status": "success",

        "cached": False,

        "topic": request.topic,

        "progress": "Completed",

        "results": response_data
    }  
import os
@app.get("/")
def root():
    return {
        "status": "alive"
    }
@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...)
):

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    file_path = (
        f"uploads/{file.filename}"
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(
            await file.read()
        )

    print("UPLOAD ENDPOINT HIT")

    load_pdf_to_chroma(
        file_path
    )

    return {
        "filename": file.filename,
        "saved_to": file_path,
        "status": "uploaded"
    }
@app.post("/analyze-pdf")
def analyze_pdf():

    result = run_pdf_pipeline()

    return {
        "status": "success",
        "results": result
    }