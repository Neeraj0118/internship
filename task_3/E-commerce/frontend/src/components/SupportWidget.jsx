import React, { useState } from 'react';
import { HelpCircle, Send, Bot, User, Phone, Mail, Clock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import * as api from '../services/api';

const FAQS = [
  {
    q: 'What are MetroMart store operating hours?',
    a: 'We are open Monday to Saturday from 8:00 AM to 9:00 PM, and Sundays from 9:00 AM to 6:00 PM.'
  },
  {
    q: 'How does same-day local delivery work?',
    a: 'Orders placed before 3:00 PM are delivered same-day directly by our local delivery fleet. Orders after 3:00 PM are delivered the next morning by 11:00 AM.'
  },
  {
    q: 'What is your freshness & return policy?',
    a: 'We offer a 100% Freshness Guarantee! If you are unsatisfied with fresh produce, dairy, or bakery items, simply contact us within 48 hours for a replacement or full refund.'
  },
  {
    q: 'How can I apply promo codes?',
    a: 'You can enter coupon codes like LOCAL10 (10% off) or FREESHIP (Free Delivery) during checkout or inside your shopping cart drawer.'
  }
];

export default function SupportWidget() {
  const { showToast } = useStore();
  
  // Interactive Chat State
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Hello! I am MetroMart AI Assistant. How can I help you with your local store order today?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Ticket Form state
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const query = chatInput.trim();
    if (!query) return;

    // Append user message
    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.submitSupportTicket({
        name: 'Guest User',
        email: 'guest@metromart.local',
        subject: 'Live Assistant Query',
        message: query
      });

      // Append bot response
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: res.reply || 'Thanks for reaching out! A local store representative will contact you soon.' }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I am having trouble connecting right now. Please try submitting a support ticket below.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.name || !ticketForm.email || !ticketForm.message) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    try {
      const res = await api.submitSupportTicket(ticketForm);
      showToast(`🎉 Ticket ${res.ticket_id} created successfully!`);
      setTicketForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      showToast(err.message || 'Failed to submit ticket', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 mb-3">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Customer Support Desk</h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
          We are here to assist with your grocery orders, store inquiries, and delivery updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Live AI Chat Assistant */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[520px]">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">MetroMart Assistant</h3>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online • Instant Answers
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                }`}>
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs italic">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Typing response...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Ask about hours, delivery, returns..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: FAQ & Ticket Form */}
        <div className="space-y-6">
          
          {/* FAQ Accordion */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Frequently Asked Questions</span>
            </h3>

            {FAQS.map((faq, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 font-bold text-slate-800 text-xs flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {openFaq === i && (
                  <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Ticket Submission Form */}
          <form onSubmit={handleTicketSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">Send Support Ticket</h3>
            <p className="text-slate-500 mb-3">If you need direct assistance from a store manager, fill out a ticket.</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Smith"
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={ticketForm.email}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Message / Request *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe your question or issue..."
                value={ticketForm.message}
                onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Submit Ticket
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
