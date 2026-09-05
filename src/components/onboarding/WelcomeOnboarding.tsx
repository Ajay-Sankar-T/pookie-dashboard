'use client';

import React, { useState } from 'react';
import { Mail, Lock, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { WaifuMascot } from '../ui/WaifuMascot';
import { SparkleField } from '../ui/SparkleField';
import { usePookie } from '@/context/PookieContext';

interface WelcomeOnboardingProps {
  /** Called once login (and, if needed, UPI setup) is complete. */
  onComplete: () => void;
}

const UPI_RE = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ onComplete }) => {
  const { login, setMyUpiId } = usePookie();
  const [step, setStep] = useState<'login' | 'upi'>('login');

  // Login step state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UPI step state
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (!result.ok) {
      setLoginError(result.error || "That didn't work 🥺");
      return;
    }
    setStep('upi');
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!UPI_RE.test(upiId.trim())) {
      setUpiError('UPI ID should look like yourname@bank 💳');
      return;
    }
    await setMyUpiId(upiId);
    onComplete();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center safe-area-px px-4 py-10 safe-area-pt safe-area-pb bg-gradient-to-br from-[#FFE9F3] via-[#FBF2FF] to-[#EAF6FF]">
      <SparkleField count={18} />

      {/* Scattered floating chibis */}
      <div className="hidden sm:block absolute top-10 left-8 w-20 h-20 animate-chibi-bob">
        <WaifuMascot pose="chibi" sizeClassName="w-20 h-20" floaty={false} />
      </div>
      <div className="hidden sm:block absolute bottom-14 right-10 w-24 h-24 animate-chibi-bob [animation-delay:0.8s]">
        <WaifuMascot pose="chibi" sizeClassName="w-24 h-24" floaty={false} />
      </div>
      <div className="hidden md:block absolute top-1/2 right-16 w-16 h-16 animate-chibi-bob [animation-delay:1.5s]">
        <WaifuMascot pose="chibi" sizeClassName="w-16 h-16" floaty={false} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="pookie-holo-border rounded-[2.5rem] bg-white/90 backdrop-blur-md border-2 border-pookie-soft shadow-pookie-lg p-6 sm:p-8">
          {/* Mascot + speech bubble */}
          <div className="flex flex-col items-center text-center mb-6">
            <WaifuMascot pose="greet" sizeClassName="w-32 h-32 sm:w-36 sm:h-36" />
            <div className="relative mt-3 bg-pookie-blush border border-pookie-soft rounded-3xl px-4 py-2.5 max-w-xs">
              <p className="text-sm font-bold text-pookie-dark leading-snug">
                {step === 'login'
                  ? "Hii Pookie~ ✨ this dashboard is just for the 11 of us. Log in?"
                  : 'One more thing~ add your UPI so friends can pay you back 💸'}
              </p>
            </div>
            <h1 className="mt-5 text-2xl sm:text-3xl font-black text-pookie-text font-kawaii tracking-tight">
              {step === 'login' ? 'Welcome to Pookie Dashboard' : "You're in! ✨"}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-pookie-muted mt-1.5">
              {step === 'login' ? 'Log in with your smail 🎀' : 'One quick step, then your hub is ready'}
            </p>
          </div>

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black uppercase text-pookie-muted tracking-wider mb-1.5">
                  <Mail className="w-3.5 h-3.5" /> Smail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="me25bxxx@smail.iitm.ac.in"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-pookie-soft text-base sm:text-sm font-semibold text-pookie-text placeholder-pookie-muted/50 focus:outline-none focus:ring-2 focus:ring-pookie-primary transition-all"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-black uppercase text-pookie-muted tracking-wider mb-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="pookie@xxx"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-pookie-soft text-base sm:text-sm font-semibold text-pookie-text placeholder-pookie-muted/50 focus:outline-none focus:ring-2 focus:ring-pookie-primary transition-all"
                  autoComplete="current-password"
                />
              </div>

              {loginError && (
                <p className="text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-center">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="pookie-glossy w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pookie-primary via-[#FF5E9E] to-pookie-lavender text-white text-sm font-black py-3.5 rounded-2xl shadow-pookie-glow active:scale-[0.97] transition-all disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4 fill-white stroke-white" />
                <span>{isSubmitting ? 'Checking...' : 'Log in'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpiSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black uppercase text-pookie-muted tracking-wider mb-1.5">
                  <Wallet className="w-3.5 h-3.5" /> Your UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="pookie@upi"
                  className={`w-full px-4 py-3 rounded-2xl bg-white border text-base sm:text-sm font-semibold text-pookie-text placeholder-pookie-muted/50 focus:outline-none focus:ring-2 focus:ring-pookie-primary transition-all ${
                    upiError ? 'border-rose-300 ring-1 ring-rose-200' : 'border-pookie-soft'
                  }`}
                  autoFocus
                />
                {upiError && <p className="text-[11px] font-bold text-rose-500 mt-1">{upiError}</p>}
              </div>

              <button
                type="submit"
                className="pookie-glossy w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pookie-primary via-[#FF5E9E] to-pookie-lavender text-white text-sm font-black py-3.5 rounded-2xl shadow-pookie-glow active:scale-[0.97] transition-all"
              >
                <Sparkles className="w-4 h-4 fill-white stroke-white" />
                <span>Let&apos;s go, Pookie!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
