import arxiv
import os

os.makedirs(
    "papers",
    exist_ok=True
)

search = arxiv.Search(
    query="Battery Health Prediction",
    max_results=1
)

client = arxiv.Client()

for paper in client.results(search):

    print("Title:")
    print(paper.title)

    import requests

    pdf_url = paper.pdf_url

    response = requests.get(
        pdf_url
    )

    with open(
        "papers/paper.pdf",
        "wb"
    ) as f:

        f.write(
            response.content
        )

    print()
    print("PDF Downloaded!")