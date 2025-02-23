import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, History, Search, ThumbsUp, Clock, User, HelpCircle } from 'lucide-react';
import io from 'socket.io-client';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface PreviousQuestion {
  id: string;
  title: string;
  question: string;
  answer: string;
  timestamp: string;
  likes: number;
  author: string;
  category: string;
}

const CommunityForum = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'previous'>('chat');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [previousQuestions, setPreviousQuestions] = useState<PreviousQuestion[]>([]);
  const socket = useRef<any>(null);

  useEffect(() => {
    // Connect to Flask WebSocket
    socket.current = io('http://127.0.0.1:5000/');

    // Listen for messages from the server
    socket.current.on('message', (data: string) => {
      const newMessage: Message = {
        id: Date.now(),
        text: data,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatHistory((prev) => [...prev, newMessage]);
    });

    // Fetch previous questions from Flask REST API
    fetch('http://127.0.0.1:5000/previous-questions')
      .then((response) => response.json())
      .then((data) => setPreviousQuestions(data));

    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Immediately add the user's message to the chat history
    setChatHistory((prev) => [...prev, newMessage]);

    // Send message through WebSocket
    if (socket.current) {
      socket.current.emit('message', message);
    }

    setMessage('');
  };

  const filteredQuestions = previousQuestions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-8 py-4 text-sm font-medium flex items-center space-x-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-white bg-opacity-10'
                    : 'hover:bg-white hover:bg-opacity-5'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Ask a Question</span>
              </button>
              <button
                onClick={() => setActiveTab('previous')}
                className={`px-8 py-4 text-sm font-medium flex items-center space-x-2 transition-colors ${
                  activeTab === 'previous'
                    ? 'bg-white bg-opacity-10'
                    : 'hover:bg-white hover:bg-opacity-5'
                }`}
              >
                <History className="w-5 h-5" />
                <span>Previous Questions</span>
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="h-[calc(100vh-16rem)]">
            {activeTab === 'chat' ? (
              <div className="h-full flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-3xl rounded-2xl px-6 py-3 ${
                          msg.isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-sm opacity-90">
                            {msg.isUser ? 'You' : 'User'}
                          </span>
                        </div>
                        <p className="text-base">{msg.text}</p>
                        <span className="text-xs opacity-75 mt-2 block flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Help Text */}
                <div className="flex items-center text-sm text-black px-4">
                  <HelpCircle className="w-4 h-4 mr-2 text-black" />
                  <span>Type <code className="bg-white/10 px-2 py-0.5 rounded text-black">/help</code> to see available commands</span>
                </div>

                {/* Message Input */}
                <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-gray-100">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask your health-related question..."
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white rounded-xl px-8 py-3 hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
                    >
                      <span>Send</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-100 bg-white">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search previous questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Previous Questions List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-6 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 text-sm text-blue-600 mb-2">
                        <span className="px-3 py-1 bg-blue-100 rounded-full">{q.category}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500 flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {q.author}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">{q.title}</h3>
                      <p className="text-gray-700 mb-4">{q.question}</p>
                      <div className="text-gray-600 mb-4">{q.answer}</div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(q.timestamp).toLocaleString()}
                        </span>
                        <span className="flex items-center text-blue-600">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {q.likes} likes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;