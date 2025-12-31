
import React, { useState } from 'react';
import { Task, Benutzer, Adresse, StatusEntry } from '../types';
import TaskTable from './TaskTable';
import TaskModal from './TaskModal';
import AddressManagementModal from './AddressManagementModal';
import StatusManagementModal from './StatusManagementModal';
import UserManagementModal from './UserManagementModal';

interface WorkbenchProps {
  onLogout: () => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  benutzer: Benutzer[];
  setBenutzer: React.Dispatch<React.SetStateAction<Benutzer[]>>;
  adressen: Adresse[];
  setAdressen: React.Dispatch<React.SetStateAction<Adresse[]>>;
  statusListe: StatusEntry[];
  setStatusListe: React.Dispatch<React.SetStateAction<StatusEntry[]>>;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
}

export type SortField = 'nachname' | 'objekttyp' | 'status' | 'bearbeiter' | 'firma' | 'plzOrt';
export type SortDirection = 'asc' | 'desc';

const Workbench: React.FC<WorkbenchProps> = ({ 
  onLogout, 
  tasks, 
  setTasks, 
  benutzer, 
  setBenutzer,
  adressen, 
  setAdressen,
  statusListe,
  setStatusListe,
  saveStatus
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ field: SortField, direction: SortDirection }>({
    field: 'status',
    direction: 'asc'
  });
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const handleSort = (field: SortField) => {
    let direction: SortDirection = 'desc'; 
    if (field === 'status') direction = 'asc';
    if (sortConfig.field === field) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ field, direction });
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const { field, direction } = sortConfig;
    let valA: any = '';
    let valB: any = '';

    switch (field) {
      case 'nachname':
        const adrA = adressen.find(ad => ad.id === a.mandantId);
        const adrB = adressen.find(ad => ad.id === b.mandantId);
        valA = adrA?.nachname || '';
        valB = adrB?.nachname || '';
        break;
      case 'objekttyp': valA = a.objekttyp; valB = b.objekttyp; break;
      case 'status': valA = a.statusId; valB = b.statusId; break;
      case 'bearbeiter':
        const userA = benutzer.find(u => u.id === a.benutzerId);
        const userB = benutzer.find(u => u.id === b.benutzerId);
        valA = userA?.nachname || ''; valB = userB?.nachname || '';
        break;
      case 'firma':
        const fA = adressen.find(ad => ad.id === a.mandantId);
        const fB = adressen.find(ad => ad.id === b.mandantId);
        valA = fA?.firma || ''; valB = fB?.firma || '';
        break;
      case 'plzOrt': valA = a.objektadresse.plzOrt; valB = b.objektadresse.plzOrt; break;
      default: return 0;
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const formatEuro = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

  const openDashboardReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const totalCount = tasks.length;
    const totalSum = tasks.reduce((sum, t) => sum + (t.grundhonorar || 0), 0);
    const anbahnungList = tasks.filter(t => t.statusId >= 1 && t.statusId <= 3);
    const inWorkList = tasks.filter(t => t.statusId >= 4 && t.statusId <= 10);
    const doneList = tasks.filter(t => t.statusId >= 11 && t.statusId <= 12);
    const sumH = (list: Task[]) => list.reduce((sum, t) => sum + (t.grundhonorar || 0), 0);

    const dashboardHtml = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
          <meta charset="UTF-8">
          <title>Management Summary - Kiefer & Kollegen</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
              @page { size: A4; margin: 10mm; }
              @media print { 
                .no-print { display: none !important; } 
                body { background: white !important; padding: 0 !important; } 
                .container-print { border: none !important; shadow: none !important; }
              }
              body { background-color: #f8fafc; font-family: 'Inter', sans-serif; color: #0f172a; padding: 20px; }
              .tile { 
                background: white; 
                border: 1px solid #e2e8f0; 
                border-radius: 1.5rem; 
                padding: 1.5rem; 
                text-align: center; 
                position: relative; 
                overflow: hidden; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
              }
              .tile-bg { 
                position: absolute; 
                top: -5%; 
                right: -5%; 
                font-size: 6rem; 
                font-weight: 900; 
                color: #f1f5f9; 
                z-index: 0; 
                opacity: 0.5;
              }
              .tile-content { position: relative; z-index: 10; }
          </style>
      </head>
      <body>
          <div class="max-w-4xl mx-auto container-print">
              <div class="no-print flex justify-end mb-6">
                  <button onclick="window.print()" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-black shadow-lg">SUMMARY DRUCKEN</button>
              </div>
              
              <div class="flex justify-between items-end border-b-[6px] border-slate-900 pb-6 mb-10">
                  <div>
                    <h1 class="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Management Summary</h1>
                    <h2 class="text-2xl font-bold text-slate-500 uppercase tracking-tight mb-2">Auftragsbestand</h2>
                    <p class="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Kiefer & Kollegen • Stand: ${new Date().toLocaleDateString('de-DE')}</p>
                  </div>
                  <div class="text-right pb-1">
                    <div class="text-[9px] font-black text-blue-900 uppercase italic">Analytics Engine 2.5</div>
                  </div>
              </div>

              <div class="grid grid-cols-2 gap-8 mb-10">
                  <div class="tile border-t-[10px] border-slate-900">
                      <div class="tile-bg">Σ</div>
                      <div class="tile-content">
                          <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Gesamtbestand</h4>
                          <div class="text-7xl font-black text-slate-900 mb-4 leading-none tracking-tighter">${totalCount}</div>
                          <div class="text-xl font-bold text-blue-900 bg-blue-50 px-6 py-2 rounded-2xl border border-blue-100 inline-block">${formatEuro(totalSum)}</div>
                      </div>
                  </div>
                  <div class="tile border-t-[10px] border-amber-400">
                      <div class="tile-bg">?</div>
                      <div class="tile-content">
                          <h4 class="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-4 italic">Anbahnung</h4>
                          <div class="text-7xl font-black text-slate-900 mb-4 leading-none tracking-tighter">${anbahnungList.length}</div>
                          <div class="text-xl font-bold text-amber-600 bg-amber-50 px-6 py-2 rounded-2xl border border-amber-100 inline-block">${formatEuro(sumH(anbahnungList))}</div>
                      </div>
                  </div>
                  <div class="tile border-t-[10px] border-blue-500">
                      <div class="tile-bg">W</div>
                      <div class="tile-content">
                          <h4 class="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">Bearbeitung</h4>
                          <div class="text-7xl font-black text-slate-900 mb-4 leading-none tracking-tighter">${inWorkList.length}</div>
                          <div class="text-xl font-bold text-blue-600 bg-blue-50 px-6 py-2 rounded-2xl border border-blue-100 inline-block">${formatEuro(sumH(inWorkList))}</div>
                      </div>
                  </div>
                  <div class="tile border-t-[10px] border-emerald-500">
                      <div class="tile-bg">V</div>
                      <div class="tile-content">
                          <h4 class="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-4 italic">Abgeschlossen</h4>
                          <div class="text-7xl font-black text-slate-900 mb-4 leading-none tracking-tighter">${doneList.length}</div>
                          <div class="text-xl font-bold text-emerald-600 bg-emerald-50 px-6 py-2 rounded-2xl border border-emerald-100 inline-block">${formatEuro(sumH(doneList))}</div>
                      </div>
                  </div>
              </div>

              <div class="flex justify-between items-center text-[9px] text-slate-300 font-bold uppercase tracking-widest pt-6 border-t border-slate-100">
                  <span>Dokument-ID: SVK-SUM-${Date.now()}</span>
                  <span>Kiefer & Kollegen SV-Workbench</span>
              </div>
          </div>
      </body>
      </html>
    `;
    reportWindow.document.write(dashboardHtml);
    reportWindow.document.close();
  };

  const openDetailReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const generateTableHtml = (title: string, subtitle: string, taskList: Task[], showUser: boolean = false) => {
      if (!taskList || taskList.length === 0) return '';
      const rows = taskList.map(t => {
        const m = adressen.find(a => a.id === t.mandantId);
        const s = statusListe.find(st => st.id === t.statusId);
        const u = benutzer.find(us => us.id === t.benutzerId);
        return `
          <tr class="border-b border-slate-100 break-inside-avoid">
            <td class="p-3 font-bold text-slate-900">${m?.nachname || '-'}</td>
            <td class="p-3 text-slate-500 text-[9px]">${m?.firma || '-'}</td>
            <td class="p-3 font-medium uppercase text-blue-800 text-[9px]">${t.objekttyp}</td>
            <td class="p-3 text-slate-600 text-[9px]">${t.objektadresse.plzOrt}</td>
            <td class="p-3 text-slate-400 italic text-[8px] leading-tight">${t.zweck}</td>
            <td class="p-3 font-black text-slate-900 uppercase text-[8px] whitespace-nowrap">
              ${showUser ? (u?.nachname || '-') : (s?.rolle || '-')}
            </td>
          </tr>
        `;
      }).join('');

      return `
        <div class="page-break mb-16">
          <div class="border-b-4 border-slate-900 mb-6 flex justify-between items-end pb-4">
            <div>
              <h2 class="text-3xl font-black text-slate-900 uppercase tracking-tighter">${title}</h2>
              <h3 class="text-xl font-bold text-slate-400 italic">${subtitle}</h3>
            </div>
            <div class="bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em]">ANZAHL: ${taskList.length}</div>
          </div>
          <table class="w-full text-left text-[10px] border-collapse bg-white shadow-sm">
            <thead>
              <tr class="bg-slate-900 text-white uppercase font-black tracking-widest">
                <th class="p-3">Mandant</th><th class="p-3">Firma</th><th class="p-3">Objektart</th><th class="p-3">Standort</th><th class="p-3">Zweck</th><th class="p-3">${showUser ? 'Bearbeiter' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    };

    let detailContent = '';
    benutzer.forEach(u => detailContent += generateTableHtml("Team-Auswertung", `Bearbeiter: ${u.vorname} ${u.nachname}`, tasks.filter(t => t.benutzerId === u.id)));
    statusListe.forEach(s => detailContent += generateTableHtml("Prozess-Status", `Phase: ${s.rolle}`, tasks.filter(t => t.statusId === s.id), true));
    ['hoch', 'normal', 'niedrig'].forEach(p => detailContent += generateTableHtml("Dringlichkeits-Check", `Priorität: ${p.toUpperCase()}`, tasks.filter(t => t.prioritaet === p)));

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
          <meta charset="UTF-8">
          <title>Detail-Analyse - Kiefer & Kollegen</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
              @page { size: A4; margin: 15mm; }
              @media print { .no-print { display: none !important; } .page-break { page-break-after: always; break-after: page; } body { background: white !important; } }
              body { background-color: #f1f5f9; font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
          </style>
      </head>
      <body>
          <div class="max-w-5xl mx-auto bg-white p-12 shadow-2xl min-h-screen">
              <div class="no-print flex justify-end mb-10">
                  <button onclick="window.print()" class="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black shadow-lg">LISTEN DRUCKEN</button>
              </div>
              <div class="flex justify-between items-start border-b-[8px] border-slate-900 pb-10 mb-16">
                  <div>
                    <h1 class="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">Detail-Analyse</h1>
                    <p class="text-slate-400 font-bold uppercase tracking-[0.5em] text-[12px]">Kiefer & Kollegen • Detaillierte Auftragsauswertung</p>
                  </div>
              </div>
              ${detailContent || '<p class="text-center p-20 text-slate-300 font-black uppercase">Keine Daten für Detailansicht vorhanden.</p>'}
          </div>
      </body>
      </html>
    `;
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-30">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                   </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-gray-800 leading-none">WorkBench SV Kiefer</span>
                  <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">Digitaler Workflow</span>
                </div>
              </div>
              
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-500 ${
                saveStatus === 'success' ? 'bg-green-50 text-green-600' : 
                saveStatus === 'saving' ? 'bg-blue-50 text-blue-600 animate-pulse' : 
                saveStatus === 'error' ? 'bg-red-50 text-red-600' : 'opacity-0'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[9px] font-black uppercase tracking-wider">
                  {saveStatus === 'success' ? 'Sicher gespeichert' : saveStatus === 'saving' ? 'Speichere...' : 'Fehler beim Sichern'}
                </span>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button 
                onClick={openDashboardReport}
                className="bg-white border border-blue-200 hover:bg-blue-600 text-blue-600 hover:text-white p-2 rounded shadow-xs transition-all group"
                title="Management Dashboard (Kacheln)"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>

              <button 
                onClick={openDetailReport}
                className="bg-white border border-emerald-200 hover:bg-emerald-600 text-emerald-600 hover:text-white p-2 rounded shadow-xs transition-all group"
                title="Detail-Analyse (Listen)"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </button>
              
              <button onClick={() => setIsStatusModalOpen(true)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-[10px] font-bold py-1.5 px-3 rounded shadow-xs transition-colors">Status</button>
              <button onClick={() => setIsUserModalOpen(true)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-[10px] font-bold py-1.5 px-3 rounded shadow-xs transition-colors">Bearbeiter</button>
              <button onClick={() => setIsAddressModalOpen(true)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-[10px] font-bold py-1.5 px-3 rounded shadow-xs transition-colors">Adressen</button>
              <button onClick={() => { setSelectedTaskId(null); setIsTaskModalOpen(true); }} className="bg-gray-800 hover:bg-black text-white text-[10px] font-bold py-1.5 px-4 rounded shadow-sm transition-colors">Auftragsverwaltung</button>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <button onClick={onLogout} className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50" title="Abmelden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-6 bg-gray-100">
           <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden max-w-[1600px] mx-auto">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
                   Auftragsübersicht
                 </h2>
                 <span className="text-[10px] text-gray-400 font-bold uppercase bg-white px-2 py-1 rounded border border-gray-200">{tasks.length} {tasks.length === 1 ? 'Eintrag' : 'Einträge'}</span>
              </div>
              <TaskTable tasks={sortedTasks} adressen={adressen} benutzer={benutzer} statusListe={statusListe} selectedTaskId={selectedTaskId} onSelectTask={setSelectedTaskId} onOpenTask={(id) => { setSelectedTaskId(id); setIsTaskModalOpen(true); }} onSort={handleSort} sortConfig={sortConfig} />
           </div>
        </div>

        <footer className="bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center text-[10px] text-gray-400 font-medium shadow-inner">
           <div>Kiefer & Kollegen Kanzlei für Immobilienbewertung</div>
           <div className="flex gap-4">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>Systemversion 2.5.0-v2</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>Zertifizierter Storage-Safe</span>
           </div>
        </footer>
      </main>

      {isTaskModalOpen && <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} tasks={tasks} setTasks={setTasks} selectedTaskId={selectedTaskId} adressen={adressen} benutzer={benutzer} statusListe={statusListe} />}
      {isAddressModalOpen && <AddressManagementModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} adressen={adressen} setAdressen={setAdressen} />}
      {isStatusModalOpen && <StatusManagementModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} statusListe={statusListe} setStatusListe={setStatusListe} />}
      {isUserModalOpen && <UserManagementModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} benutzer={benutzer} setBenutzer={setBenutzer} />}
    </div>
  );
};

export default Workbench;
