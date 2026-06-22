from typing import TypedDict

from langgraph.graph import StateGraph
import arxiv
from typing import TypedDict
from langgraph.graph import StateGraph
import google.generativeai as genai
from dotenv import load_dotenv
import os
load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

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
                "summary": result.summary
            }
        )

    return papers

class ResearchState(TypedDict):

    topic: str

    papers: list

    analyses: list

    report: str
def analyze_paper(summary):

    prompt = f"""
    Analyze this research paper.

    Return:

    1. Research Question
    2. Methodology
    3. Key Findings
    4. Limitations

    Paper Summary:

    {summary}
    """

    response = model.generate_content(
        prompt
    )

    return response.text
def generate_report(analyses):

    prompt = f"""
    You are a research assistant.

    Using the analyses below,
    generate a literature review.

    Include:

    1. Major Themes
    2. Common Methodologies
    3. Key Findings
    4. Research Limitations
    5. Future Directions

    Analyses:

    {analyses}
    """

    response = model.generate_content(
        prompt
    )

    return response.text

# --------------------
# Search Agent
# --------------------

def search_agent(state):

    print("Search Agent Running")

    papers = search_papers(
        state["topic"]
    )

    state["papers"] = papers

    return state


# --------------------
# Extraction Agent
# --------------------

def extraction_agent(state):

    print("Extraction Agent Running")

    analyses = []

    for paper in state["papers"]:

        analysis = analyze_paper(
            paper["summary"]
        )

        analyses.append(
            {
                "title": paper["title"],
                "analysis": analysis
            }
        )

    state["analyses"] = analyses
    print()

    print("FIRST ANALYSIS")

    print(
    analyses[0]
)

    return state
# --------------------
# Report Agent
# --------------------

def report_agent(state):

    print("Report Agent Running")

    report = generate_report(
        state["analyses"]
    )

    state["report"] = report

    print()
    print("REPORT GENERATED")
    print()

    print(report[:500])

    return state

graph = StateGraph(
    ResearchState
)

graph.add_node(
    "search",
    search_agent
)

graph.add_node(
    "extract",
    extraction_agent
)

graph.add_node(
    "report",
    report_agent
)

graph.add_edge(
    "search",
    "extract"
)

graph.add_edge(
    "extract",
    "report"
)

graph.set_entry_point(
    "search"
)

graph.set_finish_point(
    "report"
)

app = graph.compile()

result = app.invoke(
    {
        "topic":
        "Battery Health Prediction",

        "papers": [],

        "analyses": [],

        "report": ""
    }
)

print()
print("FINAL STATE")
print(result)