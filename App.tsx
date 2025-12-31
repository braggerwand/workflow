
import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Workbench from './components/Workbench';
import { Benutzer, Adresse, StatusEntry, Task } from './types';
import { STATUS_OPTIONEN, STATUS_FARBEN } from './constants';

// DER MASTER-KEY: Bleibt für immer gleich.
const MASTER_KEY = 'KIEFER_WORKFLOW_MASTER_STORAGE';

// Historische Keys für die Migration
const LEGACY_KEYS = [
  'KIEFER_WORKFLOW_DATABASE_V7_STABLE',
  'KIEFER_WORKFLOW_DATABASE_FINAL',
  'KIEFER_WORKFLOW_PRO_V6_benutzer',
  'KIEFER_WORKFLOW_PRO_V5_benutzer',
  'workflow_data_tasks'
];

interface FullDatabase {
  benutzer: Benutzer[];
  adressen: Adresse[];
  statusListe: StatusEntry[];
  tasks: Task[];
}

// Hilfsfunktion: Sucht in allen bekannten Speichern nach Daten
const findLatestData = (): FullDatabase => {
  console.log("Storage: Suche nach vorhandenen Daten...");
  
  // 1. Suche im Master-Key
  const master = localStorage.getItem(MASTER_KEY);
  if (master) {
    try {
      const parsed = JSON.parse(master);
      if (parsed.benutzer && parsed.benutzer.length > 0) {
        console.log("Storage: Master-Daten erfolgreich geladen.");
        return parsed;
      }
    } catch (e) { console.error("Fehler beim Parsen des Master-Keys"); }
  }

  // 2. Migration: Suche in allen alten Keys
  console.log("Storage: Master leer, starte Migration alter Versionen...");
  let mig: FullDatabase = {
    benutzer: [],
    adressen: [],
    statusListe: [],
    tasks: []
  };

  for (const key of LEGACY_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      // Wenn es ein monolithisches Objekt ist
      if (data.benutzer) mig.benutzer = data.benutzer;
      if (data.adressen) mig.adressen = data.adressen;
      if (data.statusListe) mig.statusListe = data.statusListe;
      if (data.tasks) mig.tasks = data.tasks;
      
      // Wenn es ein Einzel-Key war (z.B. V6 Benutzer)
      if (Array.isArray(data)) {
        if (key.includes('benutzer')) mig.benutzer = data;
        if (key.includes('adressen')) mig.adressen = data;
        if (key.includes('tasks')) mig.tasks = data;
      }
    } catch (e) { /* ignore */ }
  }

  // 3. Fallback: Standard-Inhaber anlegen, wenn absolut gar nichts gefunden wurde
  if (mig.benutzer.length === 0) {
    mig.benutzer = [{ id: 1, vorname: 'Michael', nachname: 'Kiefer', rolle: 'Inhaber', farbe: '#ef4444', email: 'm.kiefer@immobilienbewertung.de', telefon: '030 987654' }];
  }
  if (mig.statusListe.length === 0) {
    mig.statusListe = STATUS_OPTIONEN.map((st, i) => ({ id: i + 1, rolle: st, farbe: STATUS_FARBEN[st] }));
  }

  console.log("Storage: Migration abgeschlossen.");
  return mig;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Diese Ref verhindert, dass wir speichern, bevor wir geladen haben
  const isReadyToSave = useRef(false);

  // Initialer Ladevorgang (Synchron im State-Init)
  const [db, setDb] = useState<FullDatabase>(() => {
    const data = findLatestData();
    // Nach dem Laden setzen wir die Speichersperre nach einem kurzen Delay auf "Frei"
    setTimeout(() => { isReadyToSave.current = true; }, 100);
    return data;
  });

  // SPEICHER-EFFEKT
  useEffect(() => {
    // SPERRE: Wenn wir noch im Initialisierungs-Moment sind, NICHT speichern!
    if (!isReadyToSave.current) return;

    // PLAUSIBILITÄT: Wenn die DB plötzlich leer ist, speichern wir nicht über den Bestand!
    if (db.benutzer.length === 0) {
      console.error("Storage Critical: Versuch, leere Datenbank zu speichern wurde blockiert!");
      return;
    }

    const performSave = () => {
      setSaveStatus('saving');
      try {
        localStorage.setItem(MASTER_KEY, JSON.stringify(db));
        setSaveStatus('success');
        const t = setTimeout(() => setSaveStatus('idle'), 2000);
        return () => clearTimeout(t);
      } catch (err) {
        console.error("Storage Error:", err);
        setSaveStatus('error');
      }
    };

    performSave();
  }, [db]);

  // Wrapper-Funktionen für State-Updates (Kompatibilität zu Workbench)
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
