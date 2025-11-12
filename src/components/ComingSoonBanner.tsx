import React from 'react';
import { Construction, Sparkles } from 'lucide-react';

interface ComingSoonBannerProps {
  message?: string;
}

const ComingSoonBanner: React.FC<ComingSoonBannerProps> = ({ message = "Stay Tuned" }) => {
  return (
    <div className="relative w-full py-16 my-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-yellow-400/20 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-yellow-400/20 rounded-br-2xl" />

          <div className="mb-8 inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-white/5 border border-white/10 rounded-full p-6 backdrop-blur-xl">
                <Construction className="w-12 h-12 text-yellow-400 animate-bounce-slow" />
              </div>
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl font-display text-white/95 mb-4 tracking-wide">
            {message}
          </h2>

          <p className="text-xl text-white/70 mb-8 font-body max-w-2xl mx-auto leading-relaxed">
            We're crafting something special for you. Standard shop products will be available soon.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-400/30" />
            <Sparkles className="w-5 h-5 text-yellow-400/50" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-400/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="glass-card p-4 text-center hover:bg-white/5 transition-all duration-300">
              <div className="text-3xl mb-2">🎨</div>
              <p className="text-sm text-white/80 font-nav">Curated Collections</p>
            </div>
            <div className="glass-card p-4 text-center hover:bg-white/5 transition-all duration-300">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm text-white/80 font-nav">Limited Edition Items</p>
            </div>
            <div className="glass-card p-4 text-center hover:bg-white/5 transition-all duration-300">
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-sm text-white/80 font-nav">Exclusive Releases</p>
            </div>
          </div>

          <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/10 via-white/10 to-yellow-400/10 blur-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonBanner;
