'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/Toast';
import { Mail, HelpCircle, Send, MessageSquare, Compass, ShieldAlert } from 'lucide-react';

export default function SupportPage() {
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      showToast('error', 'Fields Incomplete', 'Please fill in all details to submit support telemetry.');
      return;
    }

    setSubmitting(true);

    // Simulate sending message to support API
    setTimeout(() => {
      showToast('success', 'Ticket Registered', 'Your support ticket has been received. Response arriving shortly.');
      
      // Clear inputs
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full select-none">
      
      {/* Header section */}
      <div className="border-b border-border-dark pb-6 mb-8 text-center sm:text-left">
        <span className="bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/20 text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded tracking-widest inline-flex items-center gap-1.5 leading-none mb-3">
          <HelpCircle className="w-3.5 h-3.5" /> Support Terminal
        </span>
        <h1 className="text-2xl sm:text-3xl font-mono font-black uppercase text-white tracking-widest leading-none">
          CONTACT <span className="text-gaming-green">SUPPORT</span>
        </h1>
        <p className="text-[10px] text-text-muted mt-2.5 uppercase font-bold tracking-wider">
          Establish secure communications. Report bugs, checkout queries, or request account wipes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Contact Form */}
        <form onSubmit={handleSubmit} className="md:col-span-7 space-y-4">
          <div className="gaming-panel p-5 sm:p-6 rounded-2xl border-border-dark bg-surface/30 relative overflow-hidden space-y-4">
            {/* Glow line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gaming-green/60" />

            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-[9px] text-text-muted font-black uppercase tracking-widest mb-1.5">
                <Compass className="w-3.5 h-3.5 text-gaming-green" />
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kylian Mbappe"
                className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg p-3 focus:border-gaming-green focus:outline-none font-mono"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-[9px] text-text-muted font-black uppercase tracking-widest mb-1.5">
                <Mail className="w-3.5 h-3.5 text-gaming-neon" />
                Return Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@gmail.com"
                className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg p-3 focus:border-gaming-green focus:outline-none font-mono"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="flex items-center gap-1.5 text-[9px] text-text-muted font-black uppercase tracking-widest mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-gaming-gold" />
                Inquiry Topic
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Razorpay payment issue / Username change problem"
                className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg p-3 focus:border-gaming-green focus:outline-none font-mono"
              />
            </div>

            {/* Message */}
            <div>
              <label className="flex items-center gap-1.5 text-[9px] text-text-muted font-black uppercase tracking-widest mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-gaming-neon" />
                Telemetry / Description
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detail your request, checkout order codes, or trigger bugs..."
                className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg p-3 focus:border-gaming-green focus:outline-none font-mono resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-lg btn-gaming-primary font-black tracking-widest text-[10px] uppercase transition-all mt-4 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 text-black" />
                  Transmit Support Code
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Side: Quick info panels */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Card 1 */}
          <div className="gaming-panel p-5 rounded-2xl border-border-dark space-y-3">
            <h3 className="text-xs font-mono font-black uppercase text-white tracking-wider">
              📧 DIRECT SECURE MAIL
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              If your request concerns transactions, premium activations, or commercial sponsorships, please contact us directly:
            </p>
            <div className="bg-[#0d0f14] border border-border-dark/60 p-3 rounded-lg text-xs font-mono text-center text-gaming-green font-bold select-text">
              support@thefanseason.com
            </div>
          </div>

          {/* Card 2 */}
          <div className="gaming-panel p-5 rounded-2xl border-border-dark space-y-3">
            <h3 className="text-xs font-mono font-black uppercase text-white tracking-wider">
              🎯 RESPONSE TIMES
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Our operators review tickets and dispatch support updates continuously. During active match fixtures, response times might stretch to **12-24 hours**. 
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              Please include your generated **Username Handle (e.g. abc_xxxxx)** and your registered Google address for faster resolution.
            </p>
          </div>
        </div>

      </div>

      <div className="text-[9px] font-mono text-center text-text-muted mt-8 uppercase tracking-widest">
        THEFANSEASON SUPPORT SERVICES • GATEWAY STATUS: ONLINE
      </div>
    </div>
  );
}
