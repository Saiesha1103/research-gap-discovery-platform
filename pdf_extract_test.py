import fitz

pdf = fitz.open(
    "papers/paper.pdf"
)

text = ""

for page in pdf:

    text += page.get_text()

print()

print("TEXT LENGTH:")

print(len(text))

print()

print("FIRST 1000 CHARACTERS:")

print()

print(text[:1000])