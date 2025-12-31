
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('SVKiefer');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In einer echten App würde hier die Validierung gegen ein Backend erfolgen.
    onLogin(true);
  };

  return (
    <div 
      className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{ 
        backgroundImage: `linear-gradient(rgba(10, 20, 40, 0.85), rgba(10, 20, 40, 0.95)), url('https://picsum.photos/id/1/1920/1080')` 
      }}
    >
      {/* Shutterstock Hinweis: Suche auf Shutterstock nach: 'Modernes Büro Meeting Architektur Hintergrund, Dunkelblau getönt' */}
      
      {/* Header Info */}
      <div className="absolute top-4 w-full flex justify-between px-8 text-white text-xs opacity-70">
        <span>Kiefer & Kollegen Digitaler Workflow</span>
        <div className="flex gap-4">
          <span>Device</span>
          <span>↺</span>
          <span>⛶</span>
        </div>
      </div>

      {/* Main Login UI */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-500/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-white text-3xl font-bold tracking-tight">Kiefer & Kollegen</h1>
        <p className="text-blue-400 text-[10px] uppercase tracking-[0.2em] mt-1 font-semibold">
           🛡 DIGITALER WORKFLOW
        </p>
      </div>

      <div className="bg-[#1a2332]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-white text-xl font-bold mb-2">Anmeldung</h2>
        <p className="text-gray-400 text-sm mb-8">Bitte authentifizieren Sie sich für den Zugriff auf interne Kanzlei-Ressourcen.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2 tracking-wider">Benutzername</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#111827]/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Benutzername eingeben"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider">Passwort</label>
              <button type="button" className="text-blue-500 text-[10px] font-bold hover:underline">Vergessen?</button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111827]/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
          >
            Anmelden <span className="text-lg">→</span>
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-center">
        <p className="text-gray-500 text-[10px] font-semibold tracking-[0.1em] mb-2 uppercase">
          © 2025 KIEFER & KOLLEGEN · KANZLEI FÜR IMMOBILIENBEWERTUNG
        </p>
        <p className="text-gray-600 text-[9px]">
          Systemversion 2.5.0-v1 · Gesichert durch AES-256
        </p>
      </footer>
    </div>
  );
};

export default Login;
