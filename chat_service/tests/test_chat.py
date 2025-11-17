"""
Tests for chat functionality
"""
import pytest
import asyncio
from app.services.chat_agent import ChatAgent, get_agent


@pytest.mark.asyncio
async def test_chat_agent_initialization():
    """Test ChatAgent can be initialized"""
    agent = ChatAgent()
    assert agent is not None
    assert agent.ollama_url is not None
    assert agent.model is not None


@pytest.mark.asyncio
async def test_chat_agent_mock_response():
    """Test ChatAgent returns mock response when Ollama unavailable"""
    agent = ChatAgent()
    
    # Collect chunks
    chunks = []
    async for chunk in agent.stream_reply("What is cash flow?"):
        chunks.append(chunk)
    
    # Should have received some response
    assert len(chunks) > 0
    full_response = "".join(chunks)
    assert len(full_response) > 0


@pytest.mark.asyncio
async def test_chat_agent_empty_message():
    """Test ChatAgent handles empty messages"""
    agent = ChatAgent()
    
    chunks = []
    async for chunk in agent.stream_reply(""):
        chunks.append(chunk)
    
    assert len(chunks) > 0
    assert "didn't receive" in "".join(chunks).lower()


def test_get_agent_singleton():
    """Test get_agent returns singleton instance"""
    agent1 = get_agent()
    agent2 = get_agent()
    assert agent1 is agent2


@pytest.mark.asyncio
async def test_conversation_context():
    """Test conversation context is maintained"""
    agent = ChatAgent()
    conv_id = "test_conv_123"
    
    # First message
    chunks1 = []
    async for chunk in agent.stream_reply("Hello", conv_id=conv_id):
        chunks1.append(chunk)
    
    # Second message in same conversation
    chunks2 = []
    async for chunk in agent.stream_reply("What did I say?", conv_id=conv_id):
        chunks2.append(chunk)
    
    # Should have conversation history
    assert conv_id in agent.conversations

