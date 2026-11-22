import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, X, Send, User, Sparkles, AlertCircle, CheckCircle2, ArrowRight, Tag, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'bot';
  content: string;
  isSystem?: boolean;
  type?: 'text' | 'deal_list';
  data?: any[]; // Array of offers
}

type ChatState = 'idle' | 'report_biz_offer' | 'report_time' | 'report_details';

const AIConcierge = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hi! I'm your DealPass Advisor. 🤖\n\nAsk me things like:\n• \"Find family deals near me\"\n• \"Best massage offers near me\"\n• \"Report an issue\"" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('idle');
  
  // Incident Report Data Staging
  const [reportData, setReportData] = useState({ 
      businessName: '', 
      offerName: '',
      dateTime: '',
      details: '' 
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const searchDeals = async (query: string): Promise<Message> => {
      // 1. Simple keyword extraction (Mock NLP)
      const lower = query.toLowerCase();
      let category = '';
      if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant')) category = 'Food';
      if (lower.includes('spa') || lower.includes('massage') || lower.includes('relax')) category = 'Spa';
      if (lower.includes('kid') || lower.includes('family') || lower.includes('fun')) category = 'Fun';
      if (lower.includes('gym') || lower.includes('fitness')) category = 'Fitness';

      let city = '';
      if (lower.includes('melbourne')) city = 'Melbourne';
      if (lower.includes('sydney')) city = 'Sydney';
      if (lower.includes('geelong')) city = 'Geelong';

      // 2. Fetch User History for "Personalization" simulation
      let personalizationMsg = "";
      if (isAuthenticated) {
         try {
             // In a real app, we'd analyze this. For now, we just fake the "insight" if they mention a category.
             if (category === 'Spa') personalizationMsg = "💆 Since you love relaxation deals, check these out:";
             else if (category === 'Food') personalizationMsg = "🍽️ Based on your dining history, I recommend:";
             else personalizationMsg = "Here are the top matches for you:";
         } catch(e) {}
      } else {
         personalizationMsg = "Here are some popular deals matching your request:";
      }

      try {
          // 3. Query API
          const params = new URLSearchParams();
          params.append('limit', '4'); // Limit results for chat
          if (category) params.append('category', category);
          if (city) params.append('city', city);
          
          // Use the raw query as keyword if no specific category found, or alongside it
          if (!category && !city) params.append('keyword', query); 
          else if (query.replace(category.toLowerCase(), '').replace(city.toLowerCase(), '').trim().length > 3) {
             // If there's extra text, use it as keyword (e.g. "Japanese food" -> cat: Food, kw: Japanese)
             params.append('keyword', query);
          }

          const res = await api.get(`/offers?${params.toString()}`);
          const offers = res.data.offers;

          if (offers.length > 0) {
              return {
                  role: 'bot',
                  content: personalizationMsg,
                  type: 'deal_list',
                  data: offers
              };
          } else {
              return {
                  role: 'bot',
                  content: `I looked for ${category || query} deals ${city ? `in ${city}` : ''} but couldn't find any matches right now. Try "All deals" or a different city.`
              };
          }

      } catch (err) {
          console.error(err);
          return { role: 'bot', content: "I'm having trouble connecting to the deal database. Please try again later." };
      }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    // AI Logic Handling
    setTimeout(async () => {
      let responseMsg: Message = { role: 'bot', content: '' };
      const lower = userMsg.toLowerCase();

      // --- INCIDENT REPORTING FLOW ---
      
      if (chatState === 'report_biz_offer') {
          // User provided business/offer info
          setReportData(prev => ({ ...prev, businessName: userMsg, offerName: 'See details' })); 
          responseMsg = { role: 'bot', content: "Thank you. Could you tell me the **date and approximate time** this happened?" };
          setChatState('report_time');
      } 
      else if (chatState === 'report_time') {
          setReportData(prev => ({ ...prev, dateTime: userMsg }));
          responseMsg = { role: 'bot', content: "Got it. Finally, please describe what happened (e.g., 'Staff refused code')." };
          setChatState('report_details');
      }
      else if (chatState === 'report_details') {
          setReportData(prev => ({ ...prev, details: userMsg }));
          
          if (isAuthenticated) {
              try {
                  await api.post('/support/report', {
                     businessName: reportData.businessName,
                     offerName: "User Report",
                     dateTime: reportData.dateTime,
                     details: userMsg
                  });
                  responseMsg = { role: 'bot', content: "I have filed a formal Incident Report. \n\nTicket ID: #TKT-Generated.\n\nIs there anything else I can help with?" };
              } catch (err) {
                  responseMsg = { role: 'bot', content: "I tried to file the report but had a connection error." };
              }
          } else {
              responseMsg = { role: 'bot', content: "I've noted this details locally, but please Log In so I can file a formal ticket." };
          }
          setChatState('idle');
      } 
      
      // --- GENERAL & RECOMMENDATION LOGIC ---
      else {
          const dealKeywords = ['find', 'show', 'recommend', 'looking for', 'deals', 'offers', 'search', 'food', 'eat', 'spa', 'massage', 'kids'];
          const isDealSearch = dealKeywords.some(k => lower.includes(k)) && !lower.includes('how to');

          if (isDealSearch && chatState === 'idle') {
             // TRIGGER DEAL SEARCH
             responseMsg = await searchDeals(userMsg);
          }
          else if ((lower.includes('refused') || lower.includes('rejected') || lower.includes('didn\'t work') || lower.includes('rude')) && chatState === 'idle') {
             responseMsg = { role: 'bot', content: "I'm so sorry to hear that! 😟\n\nTo help me fix this, **what was the name of the Business**?" };
             setChatState('report_biz_offer');
          } 
          else if (lower.includes('how') && (lower.includes('use') || lower.includes('redeem'))) {
             responseMsg = { role: 'bot', content: "To use a coupon: \n1. Go to the offer page.\n2. Click 'Unlock'.\n3. Show the QR code to the staff when you ask for the bill." };
          }
          else if (lower.includes('locked') || lower.includes('premium')) {
             responseMsg = { role: 'bot', content: "Some offers are 'Premium Only' (marked with a lock icon). You can unlock them by upgrading your membership." };
          }
          else {
             responseMsg = { role: 'bot', content: "I'm your deals assistant. Try asking me to \"Find pizza deals\" or \"Show massage offers\"." };
          }
      }

      setMessages(prev => [...prev, responseMsg]);
      setIsTyping(false);
  
    }, 1200); 
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50 flex items-center justify-center transition-transform hover:scale-105"
      >
        <Bot className="h-8 w-8 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-2xl z-50 flex flex-col border-primary/20 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex flex-row justify-between items-center space-y-0">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Bot className="h-5 w-5" />
            </div>
            <div>
                <CardTitle className="text-sm font-bold">DealPass Advisor</CardTitle>
                <p className="text-[10px] text-blue-100 flex items-center gap-1 opacity-90">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> 
                    {isTyping ? 'Thinking...' : 'Online 24/7'}
                </p>
            </div>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <ScrollArea className="h-full p-4">
            <div className="space-y-4 pb-2">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div 
                            className={`max-w-[90%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-gray-800 border text-gray-800 dark:text-gray-200 rounded-bl-sm'
                            }`}
                        >
                            {msg.content}
                        </div>

                        {/* RENDER DEAL CARDS IF TYPE MATCHES */}
                        {msg.type === 'deal_list' && msg.data && (
                            <div className="mt-3 w-full space-y-2">
                                {msg.data.map((offer: any) => (
                                    <Link to={`/offers/${offer.id}`} key={offer.id} onClick={() => setIsOpen(false)} className="block group">
                                        <div className="flex bg-white dark:bg-gray-800 border hover:border-primary rounded-lg overflow-hidden shadow-sm transition-colors p-2 gap-3">
                                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                                 <img src={offer.imageUrl || '/placeholder.svg'} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-bold text-sm truncate group-hover:text-primary">{offer.title}</h4>
                                                <p className="text-xs text-gray-500 truncate">{offer.business?.tradingName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                                        {offer.creditCost} Credits
                                                    </span>
                                                    {offer.isPremium && (
                                                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium flex items-center">
                                                            <Sparkles className="w-2 h-2 mr-1" /> VIP
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center pr-1 text-gray-300 group-hover:text-primary">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                         <div className="bg-white dark:bg-gray-800 border p-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                         </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t bg-white dark:bg-gray-900">
        <div className="flex w-full gap-2">
            <Input 
                placeholder={chatState === 'idle' ? "Find deals or ask help..." : "Type your answer..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-grow focus-visible:ring-blue-500"
                autoFocus
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIConcierge;