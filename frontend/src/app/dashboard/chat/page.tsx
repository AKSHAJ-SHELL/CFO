'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Wifi, WifiOff, ExternalLink } from 'lucide-react';

interface Source {
  title: string;
  url: string;
  name: string;
  credentials: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:8081';
const WS_URL = CHAT_SERVICE_URL.replace('http://', 'ws://').replace('https://', 'wss://');

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'user', content: 'What is our current cash flow?' },
    { id: '2', role: 'assistant', content: 'Based on your latest data, your current cash flow is $13,000 for this month. This is an increase of 15% compared to last month.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [convId] = useState<string>(() => `conv_${Date.now()}`);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket connection management
  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(`${WS_URL}/ws/chat`);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'chunk') {
              setMessages((prev) => {
                const copy = [...prev];
                const lastMessage = copy[copy.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  // Append chunk to last assistant message
                  copy[copy.length - 1] = {
                    ...lastMessage,
                    content: lastMessage.content + (data.text || ''),
                  };
                } else {
                  // Create new assistant message
                  copy.push({
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: data.text || '',
                  });
                }
                return copy;
              });
            } else if (data.type === 'sources') {
              // Add sources to the last assistant message
              setMessages((prev) => {
                const copy = [...prev];
                const lastMessage = copy[copy.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  copy[copy.length - 1] = {
                    ...lastMessage,
                    sources: data.sources || [],
                  };
                }
                return copy;
              });
            } else if (data.type === 'done') {
              setIsLoading(false);
            } else if (data.type === 'error') {
              setIsLoading(false);
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: `Error: ${data.message || 'An error occurred'}`,
                },
              ]);
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnected(false);
        };

        ws.onclose = () => {
          setConnected(false);
          // Attempt to reconnect after 3 seconds
          if (!reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              connect();
            }, 3000);
          }
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnected(false);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !connected) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    // Send message via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        text: userMessage,
        conv_id: convId,
      }));
    } else {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Not connected to chat service. Please wait for connection...',
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen py-12 px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">AI CFO Chat</h1>
            <p className="text-gray-400">Conversational AI assistant for financial questions</p>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                <span className="text-green-500 text-sm">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-500" />
                <span className="text-red-500 text-sm">Connecting...</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 h-[600px] flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mt-2 max-w-[80%] space-y-2">
                    <div className="text-xs text-gray-400 mb-1">Sources:</div>
                    {message.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-800/50 border border-gray-700 rounded p-3 hover:bg-gray-800 transition-colors text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-blue-400 flex items-center gap-1">
                              {source.title || source.name}
                              <ExternalLink className="h-3 w-3" />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{source.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{source.credentials}</div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-200 rounded-lg p-4 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your finances..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !connected}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

