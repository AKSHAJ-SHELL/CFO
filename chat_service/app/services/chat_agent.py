"""
Chat Agent with OpenAI, Groq, and Ollama streaming integration
Includes web scraping and source citations
"""
import asyncio
import httpx
import json
from typing import AsyncGenerator, Optional, Dict, Any, List, Tuple
from openai import AsyncOpenAI
from groq import AsyncGroq
from app.config import (
    OPENAI_API_KEY, 
    OPENAI_MODEL,
    GROQ_API_KEY,
    GROQ_MODEL,
    OLLAMA_BASE_URL, 
    OLLAMA_MODEL
)
from app.services.web_scraper import WebScraper
from app.services.source_citation import SourceCitationService


# Enhanced financial expert system prompt with web search context
SYSTEM_PROMPT = """You are an expert AI CFO (Chief Financial Officer) assistant with deep expertise in financial analysis, strategic planning, and business intelligence. Your role is to provide intelligent, actionable financial advice and insights based on real-time data and trusted sources.

Key capabilities:
- Financial analysis and forecasting using real-time market data
- Cash flow management and optimization
- Revenue and expense analysis
- Profitability insights and margin analysis
- Strategic business recommendations
- Risk assessment and mitigation
- Investment and growth planning
- Financial reporting and interpretation
- Market analysis and trends

Guidelines:
- Use real-time financial data from web searches when available
- Cite sources in your responses with inline references (e.g., [Source 1], [Source 2])
- Provide clear, actionable advice based on financial best practices
- Use specific numbers and metrics when available from sources
- Explain complex financial concepts in accessible language
- Consider both short-term and long-term implications
- Be thorough but concise
- Always consider risk management alongside growth opportunities
- When citing sources, mention the source name and key credentials

You can handle a wide variety of questions including:
- General financial advice and strategy
- Business growth recommendations
- Cash flow optimization
- Expense management
- Revenue growth strategies
- Investment decisions
- Financial planning
- Market analysis
- Current financial news and trends
- And any other business or financial questions

Be conversational, helpful, and intelligent in your responses. Always cite your sources when using external data."""


class ChatAgent:
    def __init__(
        self, 
        openai_api_key: str = None,
        openai_model: str = None,
        groq_api_key: str = None,
        groq_model: str = None,
        ollama_url: str = None, 
        model: str = None
    ):
        self.openai_api_key = openai_api_key or OPENAI_API_KEY
        self.openai_model = openai_model or OPENAI_MODEL
        self.groq_api_key = groq_api_key or GROQ_API_KEY
        self.groq_model = groq_model or GROQ_MODEL
        self.ollama_url = ollama_url or OLLAMA_BASE_URL
        self.ollama_model = model or OLLAMA_MODEL
        self.conversations: Dict[str, List[Dict[str, str]]] = {}
        self.openai_client = None
        self.groq_client = None
        self.web_scraper = WebScraper()
        self.source_citation = SourceCitationService()
        
        if self.openai_api_key:
            self.openai_client = AsyncOpenAI(api_key=self.openai_api_key)
        
        if self.groq_api_key:
            self.groq_client = AsyncGroq(api_key=self.groq_api_key)

    async def _check_openai_available(self) -> bool:
        """Check if OpenAI API is configured and available"""
        return self.openai_client is not None and bool(self.openai_api_key)

    async def _check_groq_available(self) -> bool:
        """Check if Groq API is configured and available"""
        return self.groq_client is not None and bool(self.groq_api_key)

    async def _check_ollama_available(self) -> bool:
        """Check if Ollama is available"""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                return response.status_code == 200
        except:
            return False

    async def _search_financial_data(self, query: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, str]]]:
        """
        Search for financial data related to the query.
        Returns tuple of (search_results, citations)
        """
        try:
            # Search for financial data
            search_results = await self.web_scraper.get_financial_data(query, max_results=5)
            
            # Extract and format citations
            citations = self.source_citation.extract_sources(query, search_results)
            formatted_citations = self.source_citation.format_citations(citations)
            
            return search_results, formatted_citations
        except Exception as e:
            print(f"Error searching financial data: {e}")
            return [], []

    def _build_context_with_sources(self, prompt: str, search_results: List[Dict[str, Any]]) -> str:
        """
        Build enhanced prompt with web search context.
        """
        if not search_results:
            return prompt
        
        context_parts = [prompt]
        context_parts.append("\n\nRelevant financial information from trusted sources:")
        
        for i, result in enumerate(search_results[:5], 1):
            title = result.get("title", "Untitled")
            content = result.get("content", "")
            url = result.get("url", "")
            
            if content:
                # Limit content length
                content_snippet = content[:500] if len(content) > 500 else content
                context_parts.append(f"\n[Source {i}] {title}")
                if url:
                    context_parts.append(f"URL: {url}")
                context_parts.append(f"Content: {content_snippet}")
        
        context_parts.append("\n\nPlease use this information to provide a comprehensive answer. Cite sources using [Source 1], [Source 2], etc.")
        
        return "\n".join(context_parts)

    async def _stream_openai_response(
        self,
        prompt: str,
        search_results: List[Dict[str, Any]],
        conv_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream response from OpenAI GPT"""
        # Get conversation history
        if conv_id not in self.conversations:
            self.conversations[conv_id] = []
        
        history = self.conversations[conv_id]
        
        # Build enhanced prompt with search context
        enhanced_prompt = self._build_context_with_sources(prompt, search_results)
        
        # Build messages with system prompt
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages.extend(history)
        messages.append({"role": "user", "content": enhanced_prompt})
        
        try:
            full_response = ""
            stream = await self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=messages,
                stream=True,
                temperature=0.7,
                max_tokens=2000,
                timeout=30.0  # 30 second timeout
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    yield content
            
            # Update conversation history
            if conv_id:
                self.conversations[conv_id].append({"role": "user", "content": prompt})
                self.conversations[conv_id].append({"role": "assistant", "content": full_response})
                
        except Exception as e:
            # Silently fail and let fallback handle it
            raise

    async def _stream_groq_response(
        self,
        prompt: str,
        search_results: List[Dict[str, Any]],
        conv_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream response from Groq API"""
        # Get conversation history
        if conv_id not in self.conversations:
            self.conversations[conv_id] = []
        
        history = self.conversations[conv_id]
        
        # Build enhanced prompt with search context
        enhanced_prompt = self._build_context_with_sources(prompt, search_results)
        
        # Build messages with system prompt
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages.extend(history)
        messages.append({"role": "user", "content": enhanced_prompt})
        
        try:
            full_response = ""
            stream = await self.groq_client.chat.completions.create(
                model=self.groq_model,
                messages=messages,
                stream=True,
                temperature=0.7,
                max_tokens=2000,
                timeout=30.0
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    yield content
            
            # Update conversation history
            if conv_id:
                self.conversations[conv_id].append({"role": "user", "content": prompt})
                self.conversations[conv_id].append({"role": "assistant", "content": full_response})
                
        except Exception as e:
            # Silently fail and let fallback handle it
            raise

    async def _stream_ollama_response(
        self,
        prompt: str,
        search_results: List[Dict[str, Any]],
        conv_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream response from Ollama (fallback)"""
        # Get conversation history
        history = self.conversations.get(conv_id or "default", [])
        
        # Build enhanced prompt with search context
        enhanced_prompt = self._build_context_with_sources(prompt, search_results)
        
        # Build messages for Ollama
        messages = history + [{"role": "user", "content": enhanced_prompt}]

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{self.ollama_url}/api/chat",
                    json={
                        "model": self.ollama_model,
                        "messages": messages,
                        "stream": True
                    }
                ) as response:
                    if response.status_code != 200:
                        raise Exception(f"Ollama returned status {response.status_code}")

                    full_response = ""
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        
                        try:
                            data = json.loads(line)
                            if "message" in data and "content" in data["message"]:
                                chunk = data["message"]["content"]
                                if chunk:
                                    full_response += chunk
                                    yield chunk
                            
                            if data.get("done", False):
                                # Update conversation history
                                if conv_id:
                                    if conv_id not in self.conversations:
                                        self.conversations[conv_id] = []
                                    self.conversations[conv_id].append({"role": "user", "content": prompt})
                                    self.conversations[conv_id].append({"role": "assistant", "content": full_response})
                        except json.JSONDecodeError:
                            continue

        except Exception as e:
            raise

    async def stream_reply(
        self, 
        prompt: str, 
        conv_id: Optional[str] = None
    ) -> AsyncGenerator[Tuple[str, Optional[List[Dict[str, str]]]], None]:
        """
        Stream reply from AI with web search integration.
        Yields tuples of (chunk, sources) where sources is None until the end.
        """
        if not prompt or not prompt.strip():
            yield ("I didn't receive a message. Please try again.", None)
            return

        # Search for financial data first
        search_results, citations = await self._search_financial_data(prompt)
        
        # Try OpenAI first
        openai_available = await self._check_openai_available()
        if openai_available:
            try:
                async for chunk in self._stream_openai_response(prompt, search_results, conv_id):
                    yield (chunk, None)  # Sources sent separately at the end
                # Send sources after response
                if citations:
                    yield ("", citations)
                return
            except Exception as e:
                # Silently fall through to Groq
                pass

        # Try Groq as fallback
        groq_available = await self._check_groq_available()
        if groq_available:
            try:
                async for chunk in self._stream_groq_response(prompt, search_results, conv_id):
                    yield (chunk, None)
                # Send sources after response
                if citations:
                    yield ("", citations)
                return
            except Exception as e:
                # Silently fall through to Ollama
                pass

        # Try Ollama as final fallback
        ollama_available = await self._check_ollama_available()
        if ollama_available:
            try:
                async for chunk in self._stream_ollama_response(prompt, search_results, conv_id):
                    yield (chunk, None)
                # Send sources after response
                if citations:
                    yield ("", citations)
                return
            except Exception as e:
                # If all fail, return error message
                yield (f"I apologize, but I'm unable to process your request at the moment. Please ensure you have at least one AI service configured (OpenAI, Groq, or Ollama).", None)
                return
        
        # If no AI service is available
        yield ("I apologize, but no AI service is currently available. Please configure OpenAI, Groq, or Ollama.", None)

    def get_sources(self, query: str) -> List[Dict[str, str]]:
        """
        Get sources for a query (synchronous version for compatibility).
        """
        # This is kept for backward compatibility
        # The async version in stream_reply is the main implementation
        return []


# Singleton instance
_agent_instance: Optional[ChatAgent] = None


def get_agent() -> ChatAgent:
    """Get or create ChatAgent instance"""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = ChatAgent()
    return _agent_instance
