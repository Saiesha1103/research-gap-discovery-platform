import arxiv
from typing import TypedDict
from click import prompt
from langgraph.graph import StateGraph
from groq import Groq
from dotenv import load_dotenv
import os
from datetime import datetime

from opentelemetry import context

load_dotenv()
from rag_utils import *

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def ask_llm(prompt):

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile", messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


def search_papers(topic):

    search = arxiv.Search(
        query=topic, max_results=5, sort_by=arxiv.SortCriterion.Relevance
    )

    client = arxiv.Client()

    papers = []

    for result in client.results(search):

        papers.append({"title": result.title, "summary": result.summary})

    return papers


class ResearchState(TypedDict):

    topic: str

    papers: list

    analyses: list

    synthesis: str

    contradictions: str

    gaps: str

    report: str

    progress: str


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

    try:

        return ask_llm(prompt)

    except Exception as e:

        return f"ERROR: {str(e)}"


def analyze_paper_rag(title):

    context = retrieve_context(f"""
        {title}
        Research Question
        Methodology
        Findings
        Limitations
        """)

    prompt = f"""
    Analyze this research paper.

    Context:

    {context}

    Return:

    1. Research Question
    2. Methodology
    3. Key Findings
    4. Limitations
    """
    return ask_llm(prompt)


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

    try:
        return ask_llm(prompt)

    except Exception as e:

        return f"ERROR: {str(e)}"


def find_research_gaps(analyses):

    prompt = f"""
    You are a research gap discovery expert.

    Analyze the following paper analyses.

    Identify:

    1. Common limitations
    2. Underexplored areas
    3. Missing research directions
    4. Opportunities for future work

    Return 3-5 research gaps.

    Analyses:

    {analyses}
    """

    try:

        return ask_llm(prompt)

    except Exception as e:

        return f"ERROR: {str(e)}"


def detect_contradictions(analyses):

    prompt = f"""
    Analyze these research paper analyses.

    Identify:

    1. Conflicting findings
    2. Opposing conclusions
    3. Different methodologies producing
       different outcomes
    4. Areas of disagreement

    If no contradictions exist,
    clearly say so.

    Analyses:

    {analyses}
    """

    try:

        return ask_llm(prompt)

    except Exception as e:

        return f"ERROR: {str(e)}"


def synthesize_research(analyses):

    prompt = f"""
    Analyze these paper analyses.

    Identify:

    1. Major Themes
    2. Common Methodologies
    3. Recurring Findings
    4. Overall Research Trends

    Analyses:

    {analyses}
    """

    try:

        return ask_llm(prompt)

    except Exception as e:

        return f"ERROR: {str(e)}"


# --------------------
# Search Agent
# --------------------


def search_agent(state):
    state["progress"] = "Searching Papers"
    print("Search Agent Running")

    papers = search_papers(state["topic"])

    state["papers"] = papers

    return state


# --------------------
# Extraction Agent
# --------------------


def extraction_agent(state):
    state["progress"] = "Analyzing Papers"

    print("Extraction Agent Running")

    analyses = []

    for paper in state["papers"]:

        analysis = analyze_paper_rag(paper["title"])

        analyses.append({"title": paper["title"], "analysis": analysis})

    state["analyses"] = analyses
    print()

    if analyses:

        print()

        print("FIRST ANALYSIS")

        print(analyses[0])

    return state


def synthesis_agent(state):
    state["progress"] = "Synthesizing Research"
    print("Synthesis Agent Running")

    synthesis = synthesize_research(state["analyses"])

    state["synthesis"] = synthesis

    return state


def contradiction_agent(state):
    state["progress"] = "Finding Contradictions"

    print("Contradiction Agent Running")

    contradictions = detect_contradictions(state["synthesis"])

    state["contradictions"] = contradictions

    return state


def gap_agent(state):
    state["progress"] = "Finding Research Gaps"

    print("Gap Agent Running")

    gaps = find_research_gaps(f"""
    Synthesis:

    {state['synthesis']}

    Contradictions:

    {state['contradictions']}
    """)

    state["gaps"] = gaps

    print()
    print("GAPS FOUND")
    print()

    print(gaps)

    return state


# --------------------
# Report Agent
# --------------------


def report_agent(state):

    state["progress"] = "Generating Final Report"

    print("Report Agent Running")

    report = generate_report(f"""
        Research Synthesis:

        {state['synthesis']}

        Contradictions:

        {state['contradictions']}

        Research Gaps:

        {state['gaps']}
        """)

    state["report"] = report

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = f"report_{timestamp}.txt"

    with open(filename, "w", encoding="utf-8") as file:

        file.write(state["report"])

    return state


graph = StateGraph(ResearchState)

graph.add_node("search", search_agent)

graph.add_node("extract", extraction_agent)
graph.add_node("synthesis", synthesis_agent)
graph.add_node("contradiction", contradiction_agent)
graph.add_node("gap", gap_agent)
graph.add_node("report", report_agent)

graph.add_edge("search", "extract")

graph.add_edge("extract", "synthesis")

graph.add_edge("synthesis", "contradiction")

graph.add_edge("contradiction", "gap")

graph.add_edge("gap", "report")

graph.set_entry_point("search")

graph.set_finish_point("report")

app = graph.compile()
# load_pdf_to_chroma()

def run_research_pipeline(topic):

    result = app.invoke(
        {
            "topic": topic,
            "papers": [],
            "analyses": [],
            "synthesis": "",
            "contradictions": "",
            "gaps": "",
            "report": "",
            "progress": "Starting",
        }
    )

    return result
def run_pdf_pipeline():

    context = retrieve_context(
        "Summarize the uploaded document"
    )

    synthesis = ask_llm(f"""
You are a senior research scientist.

Analyze the following research document.

DOCUMENT:

{context}

Produce:

1. Executive Summary (200-300 words)

2. Research Objective
   - What problem is being solved?
   - Why is it important?

3. Methodology
   - Dataset
   - Experimental setup
   - Algorithms/models used

4. Key Findings
   - Most important results
   - Performance claims

5. Strengths
   - Novel contributions
   - Practical impact

6. Limitations
   - Weaknesses
   - Missing evaluations

Be specific and evidence-based.
""")

    contradictions = ask_llm(f"""
You are a peer reviewer.

DOCUMENT:

{context}

Critically analyze the paper and identify:

1. Contradictions
2. Unsupported Claims
3. Weak Assumptions
4. Missing Evidence
5. Overstated Conclusions

For each issue provide:

- Issue
- Evidence
- Severity (Low/Medium/High)

If none exist say:

No significant contradictions found.
""")

    gaps = ask_llm(f"""
You are a research-gap discovery expert.

DOCUMENT:

{context}

Identify:

1. Unanswered Questions
2. Methodological Limitations
3. Dataset Limitations
4. Scalability Limitations
5. Real-world Deployment Challenges
6. Underexplored Research Directions

For EACH gap provide:

- Gap Description
- Why it matters
- Evidence from the paper
- Potential research opportunity
- Novelty Rating (Low/Medium/High)

Be critical and analytical.
Avoid generic answers.
""")

    report = ask_llm(f"""
Create a final professional report.

DOCUMENT:

{context}

Include:

- Executive Summary
- Research Objective
- Methodology
- Key Findings
- Contradictions
- Research Gaps
- Recommendations
""")

    return {
        "synthesis": synthesis,
        "contradictions": contradictions,
        "gaps": gaps,
        "report": report
    }