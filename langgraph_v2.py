from typing import TypedDict

from langgraph.graph import StateGraph


class ResearchState(TypedDict):

    topic: str

    papers: list

    analyses: list

    report: str


# --------------------
# Search Agent
# --------------------

def search_agent(state):

    print("Search Agent Running")

    state["papers"] = [
        "Battery Paper 1",
        "Battery Paper 2",
        "Battery Paper 3"
    ]

    return state


# --------------------
# Extraction Agent
# --------------------

def extraction_agent(state):

    print("Extraction Agent Running")

    analyses = []

    for paper in state["papers"]:

        analyses.append(
            f"Analysis of {paper}"
        )

    state["analyses"] = analyses

    return state


# --------------------
# Report Agent
# --------------------

def report_agent(state):

    print("Report Agent Running")

    state["report"] = f"""
Topic:
{state['topic']}

Papers:
{len(state['papers'])}

Analyses:
{len(state['analyses'])}
"""

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