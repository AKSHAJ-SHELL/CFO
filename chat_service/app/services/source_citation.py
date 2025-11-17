"""
Source Citation Service for extracting and formatting citations
"""
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
import re


class SourceCitationService:
    def __init__(self):
        # Trusted financial source credentials
        self.source_credentials = {
            'sec.gov': {
                'name': 'U.S. Securities and Exchange Commission (SEC)',
                'credentials': 'Official U.S. government agency responsible for enforcing federal securities laws and regulating the securities industry.'
            },
            'finance.yahoo.com': {
                'name': 'Yahoo Finance',
                'credentials': 'Leading financial data and news platform providing real-time market data, financial news, and analysis.'
            },
            'bloomberg.com': {
                'name': 'Bloomberg',
                'credentials': 'Global financial news and data provider, known for authoritative financial reporting and market analysis.'
            },
            'reuters.com': {
                'name': 'Reuters',
                'credentials': 'International news organization providing trusted financial and business news with global reach.'
            },
            'ft.com': {
                'name': 'Financial Times',
                'credentials': 'Internationally recognized financial newspaper providing in-depth analysis and reporting on global business and finance.'
            },
            'wsj.com': {
                'name': 'Wall Street Journal',
                'credentials': 'Premier financial newspaper providing comprehensive coverage of business, financial markets, and economic news.'
            },
            'marketwatch.com': {
                'name': 'MarketWatch',
                'credentials': 'Financial information website providing market data, business news, and financial analysis.'
            },
            'investing.com': {
                'name': 'Investing.com',
                'credentials': 'Financial platform providing real-time quotes, financial tools, and market analysis.'
            },
            'fool.com': {
                'name': 'The Motley Fool',
                'credentials': 'Financial services company providing investment advice, stock analysis, and financial education.'
            },
            'morningstar.com': {
                'name': 'Morningstar',
                'credentials': 'Financial services firm providing investment research, data, and analysis on stocks, funds, and markets.'
            },
        }

    def extract_sources(self, content: str, search_results: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Extract relevant sources from search results and content.
        Returns formatted citations with title, URL, and credentials.
        """
        citations = []
        seen_urls = set()
        
        for result in search_results:
            url = result.get("url", "")
            title = result.get("title", "")
            content_snippet = result.get("content", "")
            
            # Skip if no URL or already seen
            if not url or url in seen_urls:
                continue
            
            seen_urls.add(url)
            
            # Get source credentials
            source_info = self.get_source_credentials(url)
            
            citation = {
                "title": title or self._extract_title_from_url(url),
                "url": url,
                "name": source_info["name"],
                "credentials": source_info["credentials"],
                "relevance": result.get("score", 0.0)
            }
            
            citations.append(citation)
        
        # Sort by relevance score (highest first)
        citations.sort(key=lambda x: x.get("relevance", 0.0), reverse=True)
        
        return citations[:10]  # Limit to top 10 sources

    def format_citations(self, sources: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Format citations for display in the frontend.
        Ensures all required fields are present.
        """
        formatted = []
        
        for source in sources:
            formatted.append({
                "title": source.get("title", "Untitled"),
                "url": source.get("url", ""),
                "name": source.get("name", "Unknown Source"),
                "credentials": source.get("credentials", "Financial information source"),
            })
        
        return formatted

    def validate_source_credibility(self, url: str) -> bool:
        """
        Check if a source URL is from a trusted financial source.
        Returns True if source is credible.
        """
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # Remove www. prefix
        domain = domain.replace('www.', '')
        
        # Check against known financial sources
        return domain in self.source_credentials or any(
            trusted_domain in domain 
            for trusted_domain in self.source_credentials.keys()
        )

    def get_source_credentials(self, url: str) -> Dict[str, str]:
        """
        Get credentials and name for a source URL.
        Returns default if source is not recognized.
        """
        parsed = urlparse(url)
        domain = parsed.netloc.lower().replace('www.', '')
        
        # Try exact match first
        if domain in self.source_credentials:
            return self.source_credentials[domain]
        
        # Try partial match
        for trusted_domain, info in self.source_credentials.items():
            if trusted_domain in domain:
                return info
        
        # Default for unknown sources
        return {
            "name": self._extract_domain_name(domain),
            "credentials": "Financial information source"
        }

    def _extract_title_from_url(self, url: str) -> str:
        """Extract a readable title from URL"""
        parsed = urlparse(url)
        path = parsed.path.strip('/')
        
        if path:
            # Use last part of path as title
            parts = path.split('/')
            title = parts[-1].replace('-', ' ').replace('_', ' ')
            return title.title()
        
        return parsed.netloc

    def _extract_domain_name(self, domain: str) -> str:
        """Extract a readable name from domain"""
        # Remove common prefixes
        domain = domain.replace('www.', '')
        
        # Get main domain name
        parts = domain.split('.')
        if len(parts) >= 2:
            return parts[-2].title()
        
        return domain.title()

    def filter_trusted_sources(self, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter sources to only include trusted financial sources"""
        trusted = []
        
        for source in sources:
            url = source.get("url", "")
            if url and self.validate_source_credibility(url):
                trusted.append(source)
        
        return trusted

