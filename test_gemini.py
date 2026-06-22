import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=api_key)

# Load model
model = genai.GenerativeModel("gemini-2.5-flash")

# Send prompt
response = model.generate_content(
    "Explain machine learning in one sentence."
)

# Print response
print(response.text)