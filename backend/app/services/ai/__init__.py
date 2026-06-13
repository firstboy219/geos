"""Geoscan AI engine (Phase 5).

4 layers + mutation engine. LLM = Google Gemini (replaces OpenAI), vectors = Pinecone.
All external AI calls live here; nothing else in the backend calls third-party APIs
except n8n (and the tripwire engine's webhook POST back to n8n).
"""
