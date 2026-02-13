"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  conversation_id?: string;
}

interface ChatResponse {
  response: string;
  conversation_id: string;
}

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user?.id) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: ChatRequest = {
        message: input,
        ...(conversationId && { conversation_id: conversationId })
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get a response from the chatbot.');
      }

      const data: ChatResponse = await response.json();
      setConversationId(data.conversation_id);

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading authentication...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">AI Todo Chatbot</h1>
        <p className="text-sm opacity-90">Ask me to manage your tasks!</p>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Welcome to your AI Todo Assistant!</p>
            <p className="text-sm mt-2">Try saying: "Add a task to buy groceries" or "Show me my pending tasks"</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md p-3 rounded-lg shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-md p-3 rounded-lg shadow-md bg-white text-gray-800 border">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </main>

      <form onSubmit={handleSubmit} className="bg-white p-4 border-t border-gray-200 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message... (e.g., 'Add task to buy milk')"
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
