from typing import TypedDict

from langgraph.graph import StateGraph


# Shared State
class ResearchState(TypedDict):

    topic: str

    papers: list

    report: str


# Search Agent
def search_agent(state):

    print("Search Agent Running")

    state["papers"] = [
        "Paper A",
        "Paper B",
        "Paper C"
    ]

    return state


# Report Agent
def report_agent(state):

    print("Report Agent Running")

    state["report"] = f"""
    Topic:
    {state['topic']}

    Papers Found:
    {len(state['papers'])}
    """

    return state


# Build Graph
graph = StateGraph(
    ResearchState
)

graph.add_node(
    "search",
    search_agent
)

graph.add_node(
    "report",
    report_agent
)

graph.add_edge(
    "search",
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

        "report": ""
    }
)

print()
print("FINAL STATE")
print(result)