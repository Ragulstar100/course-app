import { useState } from 'react';

const GREETINGS = [
  { text: 'Hello, World', lang: 'English', flag: '🇬🇧' },
  { text: 'Hola, Mundo', lang: 'Spanish', flag: '🇪🇸' },
  { text: 'Bonjour, le Monde', lang: 'French', flag: '🇫🇷' },
  { text: 'Hallo, Welt', lang: 'German', flag: '🇩🇪' },
  { text: 'Ciao, Mondo', lang: 'Italian', flag: '🇮🇹' },
  { text: 'Olá, Mundo', lang: 'Portuguese', flag: '🇵🇹' },
  { text: 'こんにちは世界', lang: 'Japanese', flag: '🇯🇵' },
  { text: '안녕하세요, 세상', lang: 'Korean', flag: '🇰🇷' },
  { text: '你好，世界', lang: 'Chinese', flag: '🇨🇳' }
];

export default function App() {
  const [index, setIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('opacity-100 scale-100');

  const cycleGreeting = () => {
    // Smooth transition between greetings
    setAnimationClass('opacity-0 scale-95');
    setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % GREETINGS.length);
      setAnimationClass('opacity-100 scale-100');
    }, 200);
  };

  const currentGreeting = GREETINGS[index];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header/Status bar */}
      <header className="px-8 py-6 flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Live Sandbox</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          env: production_ready
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-100/50 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60">
          
          {/* Decorative Icon */}
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6 text-2xl border border-blue-100/50">
            🌍
          </div>

          {/* Interactive Greeting Showcase */}
          <div className="h-28 flex flex-col justify-center items-center mb-6">
            <h1 className={`text-4xl font-extrabold tracking-tight text-slate-900 transition-all duration-200 ${animationClass}`}>
              {currentGreeting.text}
            </h1>
            <p className={`text-sm text-slate-400 mt-2 transition-all duration-200 ${animationClass}`}>
              {currentGreeting.lang} {currentGreeting.flag}
            </p>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-8">
            Welcome to your clean workspace. The project has been reset and all previous errors have been cleared.
          </p>

          {/* Trigger Button */}
          <button
            onClick={cycleGreeting}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-950 text-white font-medium text-sm transition-all duration-200 hover:bg-slate-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 shadow-md shadow-slate-900/10 cursor-pointer"
          >
            Cycle Greeting
          </button>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="px-8 py-6 w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200/50">
        <div className="text-xs text-slate-400">
          © {new Date().getFullYear()} Sandbox. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            React 18
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            Vite
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            TypeScript
          </span>
        </div>
      </footer>
    </div>
  );
}