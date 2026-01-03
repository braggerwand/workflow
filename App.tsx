
import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Workbench from './components/Workbench';
import { Benutzer, Adresse, StatusEntry, Task } from './types';
import { STATUS_OPTIONEN, STATUS_FARBEN } from './constants';

// Lokaler Entwicklungs-URL (für VM-Einsatz)
const API_URL = '/api/data';

interface FullDatabase {
  benutzer: Benutzer[];
  adressen: Adresse[];
  statusListe: StatusEntry[];
  tasks: Task[];
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const [db, setDb] = useState<FullDatabase>({
    benutzer: [],
    adressen: [],
    statusListe: [],
    tasks: []
  });

  const isInitialMount = useRef(true);

  // 1. DATEN VOM SERVER LADEN
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Cloud: Versuche Verbindung zum Backend...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 Sek. Timeout

        const response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Server antwortet nicht korrekt");
        
        const data = await response.json();
        
        if (!data.benutzer || data.benutzer.length === 0) {
          throw new Error("Datenbank leer");
        } else {
          setDb(data);
        }
      } catch (err) {
        console.warn("Cloud: Fallback auf Standardwerte (Server nicht bereit):", err);
        // Fallback: Michael Kiefer als Inhaber anlegen
        setDb({
          benutzer: [{ id: 1, vorname: 'Michael', nachname: 'Kiefer', rolle: 'Inhaber', farbe: '#ef4444', email: 'm.kiefer@immobilienbewertung.de', telefon: '030 987654' }],
          adressen: [],
          statusListe: STATUS_OPTIONEN.map((st, i) => ({ id: i + 1, rolle: st, farbe: STATUS_FARBEN[st] })),
          tasks: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. DATEN AN SERVER SENDEN BEI ÄNDERUNG
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isLoading) return;

    const saveData = async () => {
      setSaveStatus('saving');
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(db)
        });
        
        if (!response.ok) throw new Error("Speichern fehlgeschlagen");
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error("Cloud Save Error:", err);
        setSaveStatus('error');
      }
    };

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [db, isLoading]);

  const setBenutzer = (action: React.SetStateAction<Benutzer[]>) => {
    setDb(prev => ({ ...prev, benutzer: typeof action === 'function' ? action(prev.benutzer) : action }));
  };
  const setAdressen = (action: React.SetStateAction<Adresse[]>) => {
    setDb(prev => ({ ...prev, adressen: typeof action === 'function' ? action(prev.adressen) : action }));
  };
  const setStatusListe = (action: React.SetStateAction<StatusEntry[]>) => {
    setDb(prev => ({ ...prev, statusListe: typeof action === 'function' ? action(prev.statusListe) : action }));
  };
  const setTasks = (action: React.SetStateAction<Task[]>) => {
    setDb(prev => ({ ...prev, tasks: typeof action === 'function' ? action(prev.tasks) : action }));
  };

  const handleLogin = (success: boolean) => success && setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1428] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold tracking-widest uppercase">Initialisiere Kanzlei-Kern</h2>
        <p className="text-blue-400 text-[10px] mt-2 opacity-70">Prüfe Cloud-Schnittstelle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Workbench 
          onLogout={handleLogout}
          tasks={db.tasks}
          setTasks={setTasks}
          benutzer={db.benutzer}
          setBenutzer={setBenutzer}
          adressen={db.adressen}
          setAdressen={setAdressen}
          statusListe={db.statusListe}
          setStatusListe={setStatusListe}
          saveStatus={saveStatus}
        />
      )}
    </div>
  );
};

export default App;
