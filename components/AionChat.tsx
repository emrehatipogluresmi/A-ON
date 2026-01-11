
import React, { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from '../services/geminiService';
import { Message, ChatSession } from '../types';

const AionChat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('aion_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  useEffect(() => {
    localStorage.setItem('aion_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Yeni Sohbet',
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) setCurrentSessionId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        messages: [],
        updatedAt: Date.now(),
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      sessionId = newSession.id;
    }

    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    const initialModelMsg: Message = { role: 'model', content: '', timestamp: Date.now() };

    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, messages: [...s.messages, userMsg, initialModelMsg], updatedAt: Date.now() }
        : s
    ));

    setInput('');
    setIsStreaming(true);

    try {
      let fullText = "";
      for await (const chunk of streamChatResponse(userMsg.content, [])) {
        fullText += chunk;
        setSessions(prev => prev.map(s => 
          s.id === sessionId 
            ? { 
                ...s, 
                messages: s.messages.map((m, idx) => 
                  idx === s.messages.length - 1 ? { ...m, content: fullText } : m
                ) 
              }
            : s
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { 
              ...s, 
              messages: s.messages.map((m, idx) => 
                idx === s.messages.length - 1 ? { ...m, content: "Bağlantı hatası oluştu. Lütfen tekrar deneyin." } : m
              ) 
            }
          : s
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 glass transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 border-r border-white/5`}>
        <div className="flex flex-col h-full p-6">
          <button 
            onClick={createNewSession}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm text-white/80 mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Yeni Sohbet
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-4">Geçmiş Sohbetler</p>
            {sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => { setCurrentSessionId(session.id); setIsSidebarOpen(false); }}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${currentSessionId === session.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-1.5 h-1.5 squircle shrink-0 ${currentSessionId === session.id ? 'bg-white' : 'bg-white/20'}`} />
                  <span className="text-sm truncate">{session.title}</span>
                </div>
                <button onClick={(e) => deleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 squircle bg-white/10 flex items-center justify-center border border-white/10">
                   <div className="w-3 h-3 bg-white/40 squircle" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs text-white/80 font-medium">Aion Beta</span>
                   <span className="text-[10px] text-white/30 uppercase tracking-tighter">Premium Erişim</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative pt-24 min-w-0">
        <div className="absolute inset-0 aion-gradient pointer-events-none -z-10" />

        {/* Sidebar Toggle (Mobile) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden absolute top-28 left-6 z-40 p-2 glass rounded-lg text-white/60"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 lg:px-12 space-y-12 pb-32 pt-10 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-[fadeIn_0.8s_ease-out]">
              <div className="w-20 h-20 glass squircle flex items-center justify-center border-white/10 relative">
                <div className="w-10 h-10 bg-white squircle shadow-[0_0_40px_rgba(255,255,255,0.3)]" />
                <div className="absolute inset-0 bg-white/5 animate-ping rounded-3xl" />
              </div>
              <div className="text-center space-y-3 max-w-sm">
                <h1 className="text-4xl font-light tracking-tight text-white/90">AION Zekası</h1>
                <p className="text-white/40 font-light text-sm leading-relaxed">
                  Bilişsel modül aktif. Sorularınızı yanıtlamaya, karmaşık problemleri çözmeye ve fikir üretmeye hazırım.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-md w-full">
                {['Kuantum fiziğini açıkla', 'E-posta taslağı yaz', 'Kod analizi yap', 'Şiir oluştur'].map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="glass p-3 rounded-xl text-xs text-white/40 hover:text-white/80 hover:border-white/20 transition-all text-left"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-6 group animate-[fadeIn_0.4s_ease-out] ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-10 h-10 glass squircle shrink-0 flex items-center justify-center border-white/10 mt-1">
                    <div className="w-4 h-4 bg-white/60 squircle" />
                  </div>
                )}
                <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-6 py-4 text-[15px] leading-relaxed font-light ${
                  msg.role === 'user' 
                  ? 'glass bg-white/[0.08] text-white/90 shadow-2xl' 
                  : 'text-white/80 prose prose-invert'
                }`}>
                  {msg.content || (isStreaming && i === messages.length - 1 ? <div className="flex gap-1.5 h-6 items-center"><div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" /><div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" /></div> : "")}
                </div>
                {msg.role === 'user' && (
                  <div className="w-10 h-10 bg-white/5 rounded-full shrink-0 flex items-center justify-center border border-white/5 mt-1">
                     <div className="w-5 h-5 rounded-full bg-white/20" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:px-24 bg-gradient-to-t from-black via-black/90 to-transparent">
          <form 
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto relative group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="AION'a bir şeyler sor..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-8 py-5 text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all duration-500 text-white placeholder-white/20 pr-20 shadow-2xl"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center text-black bg-white hover:scale-105 active:scale-95 disabled:bg-white/10 disabled:text-white/20 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
          <div className="flex justify-center gap-6 mt-6 opacity-30">
             <p className="text-[9px] tracking-[0.2em] uppercase">Aion Cognitive OS</p>
             <p className="text-[9px] tracking-[0.2em] uppercase">Versiyon 2.4.0-B</p>
             <p className="text-[9px] tracking-[0.2em] uppercase">Gemini 3 Pro</p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prose p { margin-bottom: 1rem; }
        .prose code { background: rgba(255,255,255,0.1); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.85em; }
        .prose pre { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow-x: auto; margin: 1rem 0; }
      `}</style>
    </div>
  );
};

export default AionChat;
