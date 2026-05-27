import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Image, Mic, Smile, Phone, Video, Info, CheckCheck, Loader2, Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getConversations, getMessages, sendMessage } from '../api';

interface MessagesPageProps {
  user: any;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ user }) => {
  const location = useLocation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
      // Polling for new messages
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  // Handle auto-selection from state
  useEffect(() => {
    if (conversations.length > 0 && location.state?.autoSelectBotId) {
      const botChat = conversations.find(c => c._id === location.state.autoSelectBotId);
      if (botChat) {
        setSelectedChat(botChat);
        // Clear state to avoid re-selection
        window.history.replaceState({}, document.title);
      }
    }
  }, [conversations, location.state]);

  // Scroll only the container, not the whole page
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await getConversations(user._id);
      setConversations(data);
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedChat) return;
    try {
      const data = await getMessages(user._id, selectedChat._id);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);
    const content = newMessage;
    setNewMessage('');

    try {
      await sendMessage(user._id, selectedChat._id, content);
      loadMessages();
      loadConversations(); // Update last message in sidebar
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center title text-2xl">
        Por favor, inicia sesión para ver tus mensajes.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-6 max-w-7xl mx-auto flex h-[calc(100vh-12rem)] min-h-[500px] gap-8">
      {/* Contacts Sidebar */}
      <div className="w-1/3 glass-card flex flex-col overflow-hidden border-r-4 border-primary-light shadow-xl h-full">
         <div className="p-8 border-b border-primary-light/10">
            <h2 className="title text-4xl mb-6 uppercase tracking-widest">Mensajes</h2>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light opacity-50" size={18} />
               <input type="text" placeholder="Buscar chat..." className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-primary-light/10 rounded-2xl outline-none focus:border-primary-light body text-sm"/>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary-light" size={40}/></div>
            ) : conversations.length === 0 ? (
              <p className="p-10 text-center body opacity-50">No tienes conversaciones aún. Sigue a alguien o haz match para chatear.</p>
            ) : conversations.map(c => (
              <div 
                key={c._id} 
                onClick={() => setSelectedChat(c)}
                className={`p-6 flex gap-4 hover:bg-primary-light/5 cursor-pointer transition-all border-b border-primary-light/5 group relative ${selectedChat?._id === c._id ? 'bg-primary-light/10' : ''}`}
              >
                 <div className="relative">
                    {c.avatar ? (
                      <img src={c.avatar} className="w-14 h-14 rounded-2xl object-cover" alt={c.name} />
                    ) : (
                      <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-white title text-xl">{c.name[0]}</div>
                    )}
                    {c.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-primary-dark"></div>}
                    {c.isAI && <div className="absolute -top-1 -left-1 bg-secondary-light text-white text-[8px] font-bold px-1 rounded-sm uppercase tracking-tighter shadow-sm">IA</div>}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                       <h3 className="title text-lg text-primary-dark dark:text-white truncate flex items-center gap-2">
                         {c.name}
                         {c.isMatch && <Heart size={14} className="text-green-500" fill="currentColor" />}
                       </h3>
                       <span className="text-[10px] opacity-40 font-bold">
                         {new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <p className="body text-sm opacity-60 truncate group-hover:text-primary-light transition-colors">{c.lastMsg}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 glass-card flex flex-col overflow-hidden shadow-2xl relative h-full">
         {!selectedChat ? (
           <div className="flex-1 flex items-center justify-center body opacity-50">Selecciona un chat para comenzar</div>
         ) : (
           <>
             {/* Chat Header */}
             <div className="p-6 bg-white/5 border-b border-primary-light/10 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-4">
                   <div className="relative">
                      {selectedChat.avatar ? (
                        <img src={selectedChat.avatar} className="w-12 h-12 rounded-2xl object-cover" alt={selectedChat.name} />
                      ) : (
                        <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-white title text-xl">{selectedChat.name[0]}</div>
                      )}
                      {selectedChat.isAI && <div className="absolute -top-1 -left-1 bg-secondary-light text-white text-[8px] font-bold px-1 rounded-sm uppercase">IA</div>}
                   </div>
                   <div>
                      <h3 className="title text-2xl text-primary-dark dark:text-white flex items-center gap-2">
                        {selectedChat.name}
                        {selectedChat.isMatch && <Heart size={18} className="text-green-500" fill="currentColor" />}
                      </h3>
                      <p className={`body text-xs font-bold uppercase tracking-widest ${selectedChat.online ? 'text-green-500' : 'opacity-40'}`}>
                        {selectedChat.online ? 'En línea' : 'Desconectado'}
                      </p>
                   </div>
                </div>
                <div className="flex gap-4 text-primary-light">
                   <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Phone size={24}/></button>
                   <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Video size={24}/></button>
                   <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Info size={24}/></button>
                </div>
             </div>

             {/* Messages Scroll Area */}
             <div 
                ref={scrollContainerRef}
                className="flex-1 p-8 overflow-y-auto bg-primary-light/5"
             >
                <div className="space-y-6 flex flex-col">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10">
                      <p className="body opacity-50">No hay mensajes en esta conversación.</p>
                      {selectedChat.isAI && <p className="body text-sm text-primary-light mt-2 italic">¡Di hola a esta inteligencia artificial!</p>}
                    </div>
                  ) : messages.map((m) => {
                    const isMe = m.sender === user._id;
                    return (
                      <div key={m._id} className={`flex gap-4 max-w-[70%] ${isMe ? 'flex-row-reverse ml-auto' : ''} animate-in slide-in-from-bottom-2 duration-300`}>
                         <div className={`p-4 shadow-md ${isMe ? 'bg-primary-light text-white rounded-[25px] rounded-tr-none' : 'bg-white dark:bg-primary-dark rounded-[25px] rounded-tl-none border border-primary-light/10'}`}>
                            <p className="body text-lg">{m.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                               <span className={`text-[10px] opacity-40 font-bold ${isMe ? 'text-white/80' : ''}`}>
                                 {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                               {isMe && <CheckCheck size={14} className="text-secondary-light"/>}
                            </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
             </div>

             {/* Input Area */}
             <form onSubmit={handleSend} className="p-6 border-t border-primary-light/10 bg-white/5">
                <div className="flex items-center gap-4 bg-white/10 dark:bg-white/5 border-2 border-primary-light/20 rounded-[35px] px-6 py-2 focus-within:border-primary-light transition-all shadow-inner">
                   <button type="button" className="text-primary-light hover:scale-110 transition-transform"><Smile size={24}/></button>
                   <button type="button" className="text-primary-light hover:scale-110 transition-transform"><Image size={24}/></button>
                   <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..." 
                      className="flex-1 py-4 bg-transparent border-none outline-none body text-lg dark:text-white placeholder:opacity-40"
                   />
                   <button type="button" className="text-primary-light hover:scale-110 transition-transform"><Mic size={24}/></button>
                   <button 
                      type="submit" 
                      disabled={sending || !newMessage.trim()}
                      className="p-3 bg-primary-light text-white rounded-full hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50"
                   >
                      {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                   </button>
                </div>
             </form>
           </>
         )}
      </div>
    </main>
  );
};
