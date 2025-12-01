"""
LLM Integration Service

This module manages interactions with the Google Gemini API.
It provides functionality for metadata extraction (dates, entities) and
retrieval-augmented generation (RAG) for answering user queries based on document context.
"""

import google.generativeai as genai
from app.core.config import settings
import json
from typing import List, Dict, Any

class LLMService:
    """
    Service class for interacting with the Google Gemini Large Language Model.
    """
    def __init__(self):
        # Initialize the Gemini client if the API key is available
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Use 'gemini-1.5-flash' for a good balance of speed and capability
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            print("Warning: GEMINI_API_KEY not set. LLM features will be disabled.")
            self.model = None

    async def extract_metadata(self, text: str) -> Dict[str, Any]:
        """
        Extracts structured metadata (dates, entities) from a given text segment using the LLM.

        Args:
            text (str): The text content to analyze.

        Returns:
            Dict[str, Any]: A dictionary containing lists of extracted 'dates' and 'entities'.
        """
        if not self.model:
            return {"dates": [], "entities": []}

        prompt = f"""
        Extract the following metadata from the legal text below. Return ONLY a valid JSON object.
        1. "dates": A list of all specific dates mentioned (YYYY-MM-DD format if possible, or original text).
        2. "entities": A list of important entities (companies, people, jurisdictions) mentioned.

        Text:
        {text[:2000]} 
        """ 
        # Note: We truncate text to 2000 chars to avoid token limits and focus on the most relevant content for metadata.

        try:
            response = self.model.generate_content(prompt)
            # Clean up the response to ensure valid JSON parsing
            content = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except Exception as e:
            print(f"LLM Extraction Error: {str(e)}")
            return {"dates": [], "entities": []}

    async def synthesize_answer(self, query: str, context_chunks: List[str]) -> str:
        """
        Generates a natural language answer to a user query based on provided context chunks.

        Args:
            query (str): The user's question.
            context_chunks (List[str]): Relevant text segments retrieved from the vector database.

        Returns:
            str: The generated answer or an error message.
        """
        if not self.model:
            return "LLM service not configured."
        
        context_str = "\n\n".join(context_chunks)
        prompt = f"""
        You are a legal assistant. Answer the user's query based ONLY on the provided context.
        If the answer is not in the context, say "I cannot find this information in the documents."
        
        Context:
        {context_str}
        
        Query: {query}
        
        Answer:
        """
        
        try:
            # Use streaming to potentially improve perceived latency (though we collect full response here)
            response = self.model.generate_content(prompt, stream=True)
            full_response = ""
            for chunk in response:
                full_response += chunk.text
            return full_response
        except Exception as e:
            return f"Error generating answer: {str(e)}"

# Global instance of the LLM service
llm_service = LLMService()
