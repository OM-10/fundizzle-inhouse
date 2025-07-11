import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { FiSend, FiUser, FiZap } from 'react-icons/fi';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function PlaygroundPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: `You searched for: "${userMsg.content}". (Grant search results will appear here.)` },
      ]);
    }, 600);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Layout title="Grant Playground" description="Try searching for grants using natural language.">
      <section className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-16 relative">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-0 w-full max-w-2xl flex flex-col h-[70vh]">
          <div className="flex flex-col flex-1 overflow-y-auto p-6 gap-4 custom-scrollbar">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Grant Search Playground</h1>
            {messages.length === 0 && (
              <div className="text-gray-400 text-center mt-12">Start by describing your funding interest or project below.</div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-base whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md border border-gray-200'
                } flex items-end gap-2`}>
                  {msg.role === 'user' ? (
                    <>
                      <span>{msg.content}</span>
                      <FiUser className="ml-2 w-5 h-5 text-primary-200" />
                    </>
                  ) : (
                    <>
                      <FiZap className="mr-2 w-5 h-5 text-primary-400" />
                      <span>{msg.content}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 p-4 border-t bg-white sticky bottom-0 z-10"
            style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
          >
            <textarea
              className="flex-1 resize-none border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px] max-h-32 bg-gray-50"
              placeholder="Type your grant interest or project..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={1}
              required
              style={{ outline: 'none' }}
            />
            <Button type="submit" size="lg" className="flex items-center gap-2 px-6 py-3" disabled={!query.trim()}>
              <FiSend className="w-5 h-5" />
            </Button>
          </form>
        </div>
        <style jsx global>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s cubic-bezier(0.4,0,0.2,1) both;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            background: #f3f4f6;
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 8px;
          }
        `}</style>
      </section>
    </Layout>
  );
}