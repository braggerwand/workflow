
import React, { useState, useEffect } from 'react';
import { Task, Adresse, Benutzer, StatusEntry, TaskAktion, AktionArt, Prioritaet } from '../types';
import { AKTION_ARTEN } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedTaskId: number | null;
  adressen: Adresse[];
  benutzer: Benutzer[];
  statusListe: StatusEntry[];
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  tasks,
  setTasks,
  selectedTaskId,
  adressen, 
  benutzer, 
  statusListe 
}) => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [currentEdit, setCurrentEdit] = useState<Partial<Task> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeletingInForm, setIsDeletingInForm] = useState(false);
  const [actionEditMode, setActionEditMode] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<Partial<TaskAktion> | null>(null);

  const [grundhonorarStr, setGrundhonorarStr] = useState('');
  const [abgerechnetesHonorarStr, setAbgerechnetesHonorarStr] = useState('');

  const formatEuro = (val: number | undefined): string => {
    if (val === undefined || isNaN(val)) return '0,00';
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const parseEuro = (str: string): number => {
    if (!str || str.trim() === '') return 0;
    const cleanStr = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Wird beim Speichern erstellt';
    return new Date(isoString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (isOpen) {
      if (selectedTaskId) {
        const taskToEdit = tasks.find(t => t.id === selectedTaskId);
        if (taskToEdit) {
          setCurrentEdit({ ...taskToEdit, aktionen: taskToEdit.aktionen || [] });
          setGrundhonorarStr(formatEuro(taskToEdit.grundhonorar));
          setAbgerechnetesHonorarStr(formatEuro(taskToEdit.abgerechnetesHonorar));
          setView('edit');
        } else {
            setView('list');
            setCurrentEdit(null);
        }
      } else {
        setView('list');
        setCurrentEdit(null);
      }
      setActionEditMode(false);
      setDeleteConfirmId(null);
      setIsDeletingInForm(false);
    }
  }, [isOpen, selectedTaskId, tasks]);

  if (!isOpen) return null;

  const handleAddNew = () => {
    const newTask: Partial<Task> = {
      statusId: 1,
      mandantId: adressen.find(a => a.rolle === 'Mandant')?.id || 1,
      prioritaet: 'normal',
      objekttyp: '',
      objektadresse: { plzOrt: '', strasseHausnummer: '' },
      zweck: '',
      stichtag: new Date().toLocaleDateString('de-DE'),
      grundhonorar: 0,
      abgerechnetesHonorar: 0,
      hinweis: '',
      benutzerId: benutzer[0]?.id || 1,
      taskRolle: 'Erstanfrage',
      aktionen: []
    };
    setCurrentEdit(newTask);
    setGrundhonorarStr('0,00');
    setAbgerechnetesHonorarStr('0,00');
    setIsDeletingInForm(false);
    setView('edit');
  };

  const handleEdit = (task: Task) => {
    setCurrentEdit({ ...task, aktionen: task.aktionen || [] });
    setGrundhonorarStr(formatEuro(task.grundhonorar));
    setAbgerechnetesHonorarStr(formatEuro(task.abgerechnetesHonorar));
    setIsDeletingInForm(false);
    setView('edit');
  };

  const handleDelete = (id: number) => {
    if (deleteConfirmId === id) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmId(null);
      if (view === 'edit') {
          setView('list');
          setCurrentEdit(null);
      }
    } else {
      setDeleteConfirmId(id);
    }
  };

  const handleFormDelete = () => {
    if (isDeletingInForm && currentEdit?.id) {
      setTasks(prev => prev.filter(t => t.id !== currentEdit.id));
      setView('list');
      setCurrentEdit(null);
      setIsDeletingInForm(false);
    } else {
      setIsDeletingInForm(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEdit) return;

    if (!currentEdit.objektadresse?.plzOrt?.trim()) {
      alert("Bitte füllen Sie das Feld PLZ & Ort aus.");
      return;
    }

    const now = new Date().toISOString();
    
    const taskToSave = {
        ...currentEdit,
        grundhonorar: parseEuro(grundhonorarStr),
        abgerechnetesHonorar: parseEuro(abgerechnetesHonorarStr),
        erstanlage: currentEdit.erstanlage || now,
        letzteAenderung: now,
        id: currentEdit.id || Math.max(0, ...tasks.map(t => t.id)) + 1
    } as Task;

    if (currentEdit.id) {
      setTasks(prev => prev.map(t => t.id === currentEdit.id ? taskToSave : t));
    } else {
      setTasks(prev => [...prev, taskToSave]);
    }
    
    setView('list');
    setCurrentEdit(null);
  };

  const handleAddNewAction = () => {
    const nowFormatted = new Date().toISOString().slice(0, 16);
    setCurrentAction({ 
      datum: nowFormatted, 
      art: 'Email (Eingang)', 
      ansprechpartner: '', 
      ansprechpartnerInternId: benutzer[0]?.id || 1,
      beschreibung: '' 
    });
    setActionEditMode(true);
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAction || !currentEdit) return;

    const newAktionen = [...(currentEdit.aktionen || [])];
    if (currentAction.id) {
      const index = newAktionen.findIndex(a => a.id === currentAction.id);
      newAktionen[index] = currentAction as TaskAktion;
    } else {
      const newActionId = Math.max(0, ...newAktionen.map(a => a.id)) + 1;
      newAktionen.push({ ...currentAction, id: newActionId } as TaskAktion);
    }
    setCurrentEdit({ ...currentEdit, aktionen: newAktionen });
    setActionEditMode(false);
    setCurrentAction(null);
  };

  const handleDeleteAction = (actionId: number) => {
    if (!currentEdit) return;
    setCurrentEdit({ ...currentEdit, aktionen: currentEdit.aktionen?.filter(a => a.id !== actionId) || [] });
  };

  const handleEditAction = (action: TaskAktion) => {
    setCurrentAction(action);
    setActionEditMode(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            {view === 'edit' && (
              <button onClick={() => setView('list')} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-blue-800">Auftragsverwaltung</h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{view === 'list' ? 'Auftragsauswahl' : 'Auftragsdetails'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">{tasks.length} Aufträge</span>
                <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">+ Neuer Auftrag</button>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px]">ID</th>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px]">Mandant</th>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px]">Objekt</th>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px]">Status</th>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px] text-right">Optionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tasks.map(t => {
                      const mandant = adressen.find(a => a.id === t.mandantId);
                      const status = statusListe.find(s => s.id === t.statusId);
                      return (
                        <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="p-3 font-mono text-gray-400 text-[10px]">#{t.id}</td>
                          <td className="p-3 font-bold text-gray-800">{mandant?.firma || `${mandant?.vorname} ${mandant?.nachname}`}</td>
                          <td className="p-3">
                            <div className="text-gray-700 font-medium">{t.objekttyp}</div>
                            <div className="text-gray-400 text-[10px]">{t.objektadresse.plzOrt}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-white shadow-xs" style={{ borderColor: status?.farbe }}>{status?.rolle}</span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end items-center gap-1">
                              {deleteConfirmId === t.id ? (
                                <div className="flex items-center gap-1 animate-in zoom-in duration-200">
                                  <button onClick={() => handleDelete(t.id)} className="bg-red-600 text-white px-2 py-1 rounded text-[9px] font-bold hover:bg-red-700">LÖSCHEN?</button>
                                  <button onClick={() => setDeleteConfirmId(null)} className="p-1 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => handleEdit(t)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-10">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Projekt-Basisdaten</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mandant *</label>
                      <select required value={currentEdit?.mandantId} onChange={(e) => setCurrentEdit({...currentEdit!, mandantId: parseInt(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm">
                        {adressen.filter(a => a.rolle === 'Mandant').map(a => (<option key={a.id} value={a.id}>{a.firma || `${a.vorname} ${a.nachname}`}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status *</label>
                      <select required value={currentEdit?.statusId} onChange={(e) => { const sid = parseInt(e.target.value); const srolle = statusListe.find(s => s.id === sid)?.rolle || 'Erstanfrage'; setCurrentEdit({...currentEdit!, statusId: sid, taskRolle: srolle}); }} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm">
                        {statusListe.map(s => <option key={s.id} value={s.id}>{s.rolle}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bearbeiter *</label>
                      <select required value={currentEdit?.benutzerId} onChange={(e) => setCurrentEdit({...currentEdit!, benutzerId: parseInt(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm">
                        {benutzer.map(u => <option key={u.id} value={u.id}>{u.vorname} {u.nachname}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Priorität *</label>
                      <select 
                        required 
                        value={currentEdit?.prioritaet} 
                        onChange={(e) => setCurrentEdit({...currentEdit!, prioritaet: e.target.value as Prioritaet})} 
                        className={`w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm font-bold ${
                          currentEdit?.prioritaet === 'hoch' ? 'text-red-600' : 
                          currentEdit?.prioritaet === 'niedrig' ? 'text-green-600' : 'text-blue-600'
                        }`}
                      >
                        <option value="niedrig">Niedrig</option>
                        <option value="normal">Normal</option>
                        <option value="hoch">Hoch</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/30 p-4 rounded-xl space-y-4 border border-blue-100/50 shadow-sm">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Objekt-Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Objekttyp *</label>
                      <input type="text" required value={currentEdit?.objekttyp} onChange={(e) => setCurrentEdit({...currentEdit!, objekttyp: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" placeholder="z.B. Einfamilienhaus" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PLZ & Ort *</label>
                        <input type="text" required value={currentEdit?.objektadresse?.plzOrt} onChange={(e) => setCurrentEdit({...currentEdit!, objektadresse: {...currentEdit!.objektadresse!, plzOrt: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" placeholder="12345 Musterstadt" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Straße & Hausnummer</label>
                        <input type="text" value={currentEdit?.objektadresse?.strasseHausnummer} onChange={(e) => setCurrentEdit({...currentEdit!, objektadresse: {...currentEdit!.objektadresse!, strasseHausnummer: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" placeholder="Musterstraße 1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl space-y-4 border border-blue-200 shadow-md">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Auftrag-Infos & Honorar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Wertermittlungsstichtag
                        </label>
                      </div>
                      <input 
                        type="text" 
                        list="stichtag-suggestions"
                        value={currentEdit?.stichtag} 
                        onChange={(e) => setCurrentEdit({...currentEdit!, stichtag: e.target.value})} 
                        placeholder="TT.MM.JJJJ oder Text..."
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" 
                      />
                      <datalist id="stichtag-suggestions">
                         <option value={new Date().toLocaleDateString('de-DE')} />
                         <option value="Stichtag der Ortsbesichtigung" />
                         <option value="Aktueller Stichtag" />
                         <option value="Historischer Stichtag" />
                      </datalist>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Grundhonorar</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 font-bold text-xs">€</span>
                        </div>
                        <input 
                          type="text" 
                          value={grundhonorarStr} 
                          onChange={(e) => setGrundhonorarStr(e.target.value)}
                          onBlur={() => setGrundhonorarStr(formatEuro(parseEuro(grundhonorarStr)))}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 pl-7 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-right" 
                          placeholder="0,00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Abgerechnetes Honorar</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 font-bold text-xs">€</span>
                        </div>
                        <input 
                          type="text" 
                          value={abgerechnetesHonorarStr} 
                          onChange={(e) => setAbgerechnetesHonorarStr(e.target.value)}
                          onBlur={() => setAbgerechnetesHonorarStr(formatEuro(parseEuro(abgerechnetesHonorarStr)))}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 pl-7 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-right" 
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Zweck des Gutachtens *</label>
                    <input 
                      type="text" 
                      required
                      value={currentEdit?.zweck} 
                      onChange={(e) => setCurrentEdit({...currentEdit!, zweck: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-inner" 
                      placeholder="z.B. Beleihungswert, Kaufpreisermittlung" 
                    />
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl space-y-3 border border-gray-200 shadow-inner">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">System-Informationen</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Erstanlage</label>
                      <input 
                        type="text" 
                        value={formatDateTime(currentEdit?.erstanlage)} 
                        readOnly 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] text-gray-500 cursor-not-allowed outline-none font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Letzte Änderung</label>
                      <input 
                        type="text" 
                        value={formatDateTime(currentEdit?.letzteAenderung)} 
                        readOnly 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] text-gray-500 cursor-not-allowed outline-none font-mono" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    {currentEdit?.id && (
                      <button 
                        type="button"
                        onClick={handleFormDelete}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border ${
                          isDeletingInForm 
                          ? 'bg-red-600 text-white border-red-700 animate-pulse scale-105' 
                          : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {isDeletingInForm ? 'WIRKLICH LÖSCHEN?' : 'Auftrag löschen'}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors">Auftrag speichern</button>
                  </div>
                </div>
              </form>

              <div className="pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold text-blue-800">Kontakthistorie / Aktionen</h4>
                  {!actionEditMode && (<button onClick={handleAddNewAction} className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-[10px] font-bold py-1.5 px-3 rounded-md shadow-sm">+ Neue Aktion</button>)}
                </div>

                {actionEditMode ? (
                  <form onSubmit={handleSaveAction} className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Datum/Zeit *</label>
                        <input type="datetime-local" required value={currentAction?.datum} onChange={(e) => setCurrentAction({...currentAction!, datum: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Art *</label>
                        <select required value={currentAction?.art} onChange={(e) => setCurrentAction({...currentAction!, art: e.target.value as AktionArt})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500">
                          {AKTION_ARTEN.map(art => <option key={art} value={art}>{art}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ansprechpartner (extern) *</label>
                        <input type="text" required value={currentAction?.ansprechpartner} onChange={(e) => setCurrentAction({...currentAction!, ansprechpartner: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500" placeholder="Externer Kontakt" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ansprechpartner (intern) *</label>
                        <select required value={currentAction?.ansprechpartnerInternId} onChange={(e) => setCurrentAction({...currentAction!, ansprechpartnerInternId: parseInt(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500">
                          {benutzer.map(u => <option key={u.id} value={u.id}>{u.vorname} {u.nachname}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Beschreibung *</label>
                      <textarea required value={currentAction?.beschreibung} onChange={(e) => setCurrentAction({...currentAction!, beschreibung: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs h-24 outline-none focus:ring-1 focus:ring-blue-500" placeholder="Zusammenfassung des Kontakts..." />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => { setActionEditMode(false); setCurrentAction(null); }} className="px-4 py-1.5 text-xs font-bold text-gray-500">Abbrechen</button>
                      <button type="submit" className="px-6 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md">Aktion übernehmen</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {currentEdit?.aktionen?.length ? [...currentEdit.aktionen].reverse().map((aktion) => {
                      const intern = benutzer.find(u => u.id === aktion.ansprechpartnerInternId);
                      return (
                        <div key={aktion.id} className="group bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:border-blue-100 transition-all">
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold text-gray-400">{new Date(aktion.datum).toLocaleString('de-DE')}</span>
                                <h5 className="text-xs font-bold text-gray-700">
                                  {aktion.art} | <span className="text-blue-600">{aktion.ansprechpartner}</span> <span className="text-gray-400 font-normal mx-1">↔</span> <span className="text-gray-700">{intern ? `${intern.vorname} ${intern.nachname}` : 'Unbekannt'}</span>
                                </h5>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditAction(aktion)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                                <button onClick={() => handleDeleteAction(aktion.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2 italic">"{aktion.beschreibung || 'Keine Beschreibung.'}"</p>
                          </div>
                        </div>
                      );
                    }) : (<div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl text-xs text-gray-400 italic">Noch keine Aktionen.</div>)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
