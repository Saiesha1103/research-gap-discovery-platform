from rag_utils import *

load_pdf_to_chroma()

context = retrieve_context(
    "What are the limitations?"
)

print(context)
