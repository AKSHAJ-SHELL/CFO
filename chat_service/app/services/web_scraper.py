"""
Web Scraping Service for Financial Data
"""
import asyncio
import httpx
from typing import List, Dict, Optional, Any
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
from app.config import TAVILY_API_KEY, FINANCIAL_SOURCES


class WebScraper:
    def __init__(self, tavily_api_key: str = None):
        self.tavily_api_key = tavily_api_key or TAVILY_API_KEY
        self.tavily_base_url = "https://api.tavily.com"
        self.financial_sources = FINANCIAL_SOURCES

    async def search_web(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search the web using Tavily API for general web search.
        Returns list of search results with title, url, content, and score.
        """
        if not self.tavily_api_key:
            # Fallback to basic web search without API
            return await self._basic_web_search(query, max_results)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.tavily_base_url}/search",
                    json={
                        "api_key": self.tavily_api_key,
                        "query": query,
                        "search_depth": "basic",
                        "include_answer": True,
                        "include_raw_content": False,
                        "max_results": max_results,
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    
                    # Include answer if available
                    if data.get("answer"):
                        results.append({
                            "title": "Summary",
                            "url": "",
                            "content": data["answer"],
                            "score": 1.0,
                            "source": "tavily"
                        })
                    
                    # Include search results
                    for result in data.get("results", []):
                        results.append({
                            "title": result.get("title", ""),
                            "url": result.get("url", ""),
                            "content": result.get("content", ""),
                            "score": result.get("score", 0.0),
                            "source": "tavily"
                        })
                    
                    return results
                else:
                    return await self._basic_web_search(query, max_results)
                    
        except Exception as e:
            print(f"Tavily API error: {e}")
            return await self._basic_web_search(query, max_results)

    async def _basic_web_search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Fallback basic web search when Tavily is not available"""
        # This is a placeholder - in production, you might use DuckDuckGo or other free search
        return []

    async def scrape_financial_site(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Directly scrape a financial website for content.
        Returns structured data with title, content, and metadata.
        """
        try:
            async with httpx.AsyncClient(
                timeout=10.0,
                follow_redirects=True,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            ) as client:
                response = await client.get(url)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'lxml')
                    
                    # Extract title
                    title = ""
                    if soup.title:
                        title = soup.title.string.strip()
                    elif soup.find('h1'):
                        title = soup.find('h1').get_text().strip()
                    
                    # Remove script and style elements
                    for script in soup(["script", "style", "nav", "footer", "header"]):
                        script.decompose()
                    
                    # Extract main content
                    content = ""
                    
                    # Try to find main content areas
                    main_content = (
                        soup.find('main') or
                        soup.find('article') or
                        soup.find('div', class_=re.compile(r'content|article|main', re.I)) or
                        soup.find('body')
                    )
                    
                    if main_content:
                        # Get text and clean it
                        content = main_content.get_text(separator=' ', strip=True)
                        # Clean up whitespace
                        content = re.sub(r'\s+', ' ', content)
                        # Limit content length
                        content = content[:5000]  # Limit to 5000 characters
                    else:
                        content = soup.get_text(separator=' ', strip=True)
                        content = re.sub(r'\s+', ' ', content)
                        content = content[:5000]
                    
                    return {
                        "title": title,
                        "url": url,
                        "content": content,
                        "source": "scraped"
                    }
                else:
                    return None
                    
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    async def get_financial_data(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search financial-specific sources for relevant data.
        Combines web search with targeted financial site scraping.
        """
        results = []
        
        # First, do a general web search with financial context
        financial_query = f"{query} financial analysis market data"
        search_results = await self.search_web(financial_query, max_results=max_results)
        results.extend(search_results)
        
        # Then, try to scrape specific financial sites if query matches
        query_lower = query.lower()
        
        # Check if query is about SEC filings
        if any(term in query_lower for term in ['sec', 'filing', 'edgar', '10-k', '10-q', '8-k']):
            # Could add specific SEC EDGAR scraping here
            pass
        
        # Check if query is about market data
        if any(term in query_lower for term in ['stock', 'market', 'price', 'ticker', 'nasdaq', 'nyse']):
            # Could add Yahoo Finance scraping here
            pass
        
        # Remove duplicates based on URL
        seen_urls = set()
        unique_results = []
        for result in results:
            url = result.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_results.append(result)
            elif not url:  # Include results without URLs (like summaries)
                unique_results.append(result)
        
        return unique_results[:max_results]

    async def scrape_multiple_urls(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Scrape multiple URLs concurrently"""
        tasks = [self.scrape_financial_site(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out None and exceptions
        valid_results = []
        for result in results:
            if result and isinstance(result, dict):
                valid_results.append(result)
        
        return valid_results

    def is_financial_source(self, url: str) -> bool:
        """Check if URL is from a trusted financial source"""
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        financial_domains = [
            'sec.gov',
            'finance.yahoo.com',
            'bloomberg.com',
            'reuters.com',
            'ft.com',
            'wsj.com',
            'marketwatch.com',
            'investing.com',
            'fool.com',
            'morningstar.com',
        ]
        
        return any(financial_domain in domain for financial_domain in financial_domains)

