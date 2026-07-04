# 🧠 ResearchGap AI
### Multi-Agent Research Gap Discovery Platform

> Discover contradictions, uncover unexplored research directions, and automate literature review using AI-powered autonomous agents.

---

## 🚀 Overview

ResearchGap AI is a full-stack Multi-Agent AI platform that automates the literature review process.

Instead of manually reading hundreds of research papers, the platform orchestrates specialized AI agents to:

- Collect and analyze research papers
- Detect contradictions across literature
- Identify unexplored research gaps
- Generate structured literature review reports
- Answer research queries using Retrieval-Augmented Generation (RAG)

---

## ✨ Features

- 📄 PDF Upload & Document Parsing
- 🤖 Multi-Agent Research Pipeline using LangGraph
- 🔍 Retrieval-Augmented Generation (RAG)
- 🧠 Semantic Search using ChromaDB
- 📚 Automated Literature Review
- ⚠️ Contradiction Detection
- 💡 Research Gap Identification
- 📑 Structured Report Generation
- 📈 Interactive Research Dashboard
- 🌐 Modern React Interface

---

# 🏗️ System Architecture

```
                 Research Papers
                        │
                        ▼
              Document Ingestion
                        │
                        ▼
              PDF Parsing & Chunking
                        │
                        ▼
               Embedding Generation
                        │
                        ▼
                    ChromaDB
                        │
                        ▼
           LangGraph Multi-Agent System
        ┌────────────────────────────────┐
        │ Research Collector             │
        │ Paper Analysis Agent           │
        │ Contradiction Detection Agent  │
        │ Research Gap Finder Agent      │
        │ Report Generation Agent        │
        └────────────────────────────────┘
                        │
                        ▼
            Literature Review Report
```

---

# 🤖 Multi-Agent Workflow

The platform consists of five specialized AI agents:

### 📥 Research Collector
Extracts metadata, citations, authors and publication information from uploaded papers.

---

### 📑 Paper Analysis Agent
Summarizes papers, identifies methodologies, objectives, datasets and key findings.

---

### ⚠️ Contradiction Detection Agent
Compares findings across papers to identify conflicting claims and inconsistencies.

---

### 💡 Research Gap Finder
Discovers underexplored topics, missing experiments and future research opportunities.

---

### 📄 Report Generation Agent
Compiles all outputs into a structured literature review report.

---

# 📸 Screenshots

## Landing Page

![Landing Page](screenshots/hero.png)

---

## Research Session

![Session](screenshots/session.png)

---

## Workspace

![Workspace](screenshots/workspace.png)

---

## Multi-Agent Analysis

![Analysis](screenshots/analysis.png)

---

## Generated Report

![Report](screenshots/report.png)

---

# 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend

- FastAPI
- Python

### AI

- LangGraph
- LangChain
- OpenAI API
- Google Gemini API

### Retrieval

- ChromaDB
- RAG Pipeline
- Embedding Models

### Database

- PostgreSQL
- ChromaDB

---

# 📂 Project Structure

```
ResearchGapAI
│
├── frontend
├── backend
├── screenshots
├── README.md
└── LICENSE
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/yourusername/ResearchGapAI.git
```

Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔮 Future Improvements

- Citation Network Visualization
- arXiv Integration
- Semantic Scholar Integration
- Multi-user Collaboration
- Research Trend Prediction
- Knowledge Graph Expansion
- Docker Deployment

---

# 👩‍💻 Author

**Saiesha Krishnan**

B.Tech Mechanical & Automation Engineering

AI • Full Stack • Multi-Agent Systems • RAG • FastAPI • React

---
