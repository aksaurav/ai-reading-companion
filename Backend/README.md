# Companion.AI — Full-Stack Multimedia RAG Platform

Companion.AI is a high-performance, responsive web workspace that transforms arbitrary multimedia sources into deep contextual knowledge. Built with the MERN stack, the application splits workflows into an automated data ingestion pipeline and an intuitive semantic query interface. It allows users to feed video transcripts or web text streams into a high-dimensional vector space, enabling real-time, context-aware AI interactions backed by verifiable sources with zero LLM hallucinations.

🚀 **Live Production Workspace:** [Insert your Vercel URL here after deploying]  
🔗 **Backend Engine API:** [Insert your Render API URL here after deploying]

---

## 🌌 System Architecture Diagram


The platform handles real-time semantic query execution through a four-tier architecture:
1. **Inbound Processing:** Extracts text data streams from input sources (e.g., YouTube transcripts or markdown text feeds).
2. **Vector Space Mapping:** Tokenizes and converts textual data chunks into dense 1024-dimension vector embeddings.
3. **Pinecone Indexing:** Syncs raw embeddings directly into a Pinecone vector database index for ultra-low latency similarity matching.
4. **Context Retrieval (RAG):** Extracts relevant semantic vector data points dynamically and injects them straight into a Groq AI core inference stream to generate deterministic, source-backed answers.

---

## ✨ Features

- **Split-Screen Terminal Workspace:** Fluid, edge-to-edge, borderless dashboard completely responsive from 4K ultra-wide monitors down to standard mobile displays.
- **Dynamic Context Loading:** Asynchronous input tracking pipeline that ingests, vectors, and syncs data to database pools without page reloads.
- **Source Verification Engine:** Returns precise source maps detailing exactly where the AI core extracted historical context details.
- **Cyberpunk Glassmorphism UI:** Immersive developer-first dark workspace using custom React inline structural styling grids and glassmorphic backdrops.

---

## 🛠️ Technology Stack

- **Frontend Core:** React, TypeScript, HTML5, CSS3 Flexbox/Grid
- **Backend Infrastructure:** Node.js, Express.js
- **Vector Database Ecosystem:** Pinecone (1024-dimension indices)
- **AI Engine Layer:** Groq Core API
- **Primary Data Layer:** MongoDB Atlas (Session & metadata tracking)

---

## ⚙️ Local Installation & Configuration

To set up a local development node instance, follow these steps:

### Prerequisite Environment Keys
Create a `.env` file within your **Backend** folder containing the following configuration parameters:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
PINECONE_API_KEY=your_pinecone_secret_key
GROQ_API_KEY=your_groq_api_secret_key


