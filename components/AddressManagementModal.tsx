
import React, { useState } from 'react';
import { Adresse, RolleAdresse, Verbindung } from '../types';
import { ADRESS_ROLLEN } from '../constants';

interface AddressManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  adressen: Adresse[];
  setAdressen: React.Dispatch<React.SetStateAction<Adresse[]>>;
}

const AddressManagementModal: React.FC<AddressManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  adressen, 
  setAdressen 
}) => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [currentEdit, setCurrentEdit] = useState<Partial<Adresse> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // States für Verbindungen
  const [connectionEditMode, setConnectionEditMode] = useState(false);
  const [currentConnEdit, setCurrentConnEdit] = useState<Partial<Verbindung> | null>(null);
  const [deleteConnConfirmId, setDeleteConnConfirmId] = useState<number | null>(null);
  const [connErrors, setConnErrors] = useState<{ art?: string; zielAdresseId?: string }>({});

  const [errors, setErrors] = useState<{
    nachname?: string;
    rolle?: string;
    anrede?: string;
    kontakt?: string;
    email?: string;
  }>({});

  if (!isOpen) return null;

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

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    const hasFirmaField = !!currentEdit?.firma?.trim();
    const hasNachname = !!currentEdit?.nachname?.trim();
    const hasAnrede = !!currentEdit?.anrede;

    // Dynamische Pflichtfeld-Prüfung: Entweder Firma oder Nachname muss vorhanden sein
    if (!hasFirmaField && !hasNachname) {
      newErrors.nachname = 'Bitte geben Sie entweder einen Nachnamen oder eine Firma an.';
    }

    // Anrede ist nur Pflicht, wenn keine Firma im Firmenfeld vorhanden ist
    if (!hasFirmaField && !hasAnrede) {
      newErrors.anrede = 'Bitte wählen Sie eine Anrede aus.';
    }

    if (!currentEdit?.rolle) newErrors.rolle = 'Bitte wählen Sie eine Rolle aus.';

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (currentEdit?.email && !emailRegex.test(currentEdit.email)) {
      newErrors.email = 'Ungültiges Email-Format.';
    }

    if (!currentEdit?.handy?.trim() && !currentEdit?.telefon?.trim()) {
      newErrors.kontakt = 'Mindestens eine Telefonnummer ist erforderlich.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNew = () => {
    setCurrentEdit({
      anrede: '',
      vorname: '',
      nachname: '',
      firma: '',
      rolle: 'Mandant',
      plzOrt: '',
      strasseHausnummer: '',
      email: '',
      handy: '',
      telefon: '',
      website: '',
      notiz: '',
      verbindungen: []
    });
    setErrors({});
    setConnectionEditMode(false);
    setDeleteConnConfirmId(null);
    setView('edit');
  };

  const handleEdit = (adr: Adresse) => {
    setCurrentEdit({ ...adr, verbindungen: adr.verbindungen || [] });
    setErrors({});
    setConnectionEditMode(false);
    setDeleteConnConfirmId(null);
    setView('edit');
  };

  const handleDelete = (id: number) => {
    if (deleteConfirmId === id) {
      setAdressen(prev => prev.filter(a => a.id !== id));
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEdit) return;
    if (!validate()) return;

    const now = new Date().toISOString();
    
    const dataToSave = {
      ...currentEdit,
      erstanlage: currentEdit.erstanlage || now,
      letzteAenderung: now
    } as Adresse;

    if (currentEdit.id) {
      setAdressen(prev => prev.map(a => a.id === currentEdit.id ? dataToSave : a));
    } else {
      const newId = Math.max(0, ...adressen.map(a => a.id)) + 1;
      setAdressen(prev => [...prev, { ...dataToSave, id: newId }]);
    }
    setView('list');
    setCurrentEdit(null);
  };

  // VERBINDUNGS LOGIK
  const handleAddConnection = () => {
    setCurrentConnEdit({
      art: '',
      zielAdresseId: undefined
    });
    setConnErrors({});
    setConnectionEditMode(true);
    setDeleteConnConfirmId(null);
  };

  const handleSaveConnection = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    
    const newConnErrors: typeof connErrors = {};
    if (!currentConnEdit?.zielAdresseId) {
      newConnErrors.zielAdresseId = 'Bitte wählen Sie einen Kontakt aus.';
    }
    if (!currentConnEdit?.art?.trim()) {
      newConnErrors.art = 'Bitte geben Sie die Art der Verbindung an.';
    }

    if (Object.keys(newConnErrors).length > 0) {
      setConnErrors(newConnErrors);
      return;
    }

    if (!currentEdit) return;

    const newConnections = [...(currentEdit.verbindungen || [])];
    if (currentConnEdit?.id) {
      const idx = newConnections.findIndex(c => c.id === currentConnEdit.id);
      if (idx !== -1) {
        newConnections[idx] = currentConnEdit as Verbindung;
      }
    } else {
      const nextId = Math.max(0, ...newConnections.map(c => c.id)) + 1;
      newConnections.push({ ...currentConnEdit, id: nextId } as Verbindung);
    }

    setCurrentEdit({ ...currentEdit, verbindungen: newConnections });
    setConnectionEditMode(false);
    setCurrentConnEdit(null);
    setDeleteConnConfirmId(null);
    setConnErrors({});
  };

  const handleDeleteConnection = (connId: number) => {
    if (deleteConnConfirmId === connId) {
      if (!currentEdit) return;
      setCurrentEdit({
        ...currentEdit,
        verbindungen: currentEdit.verbindungen?.filter(c => c.id !== connId) || []
      });
      setDeleteConnConfirmId(null);
    } else {
      setDeleteConnConfirmId(connId);
    }
  };

  const handleEditConnection = (conn: Verbindung) => {
    setCurrentConnEdit(conn);
    setConnErrors({});
    setConnectionEditMode(true);
    setDeleteConnConfirmId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            {view === 'edit' && (
              <button onClick={() => setView('list')} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-blue-800">Kontaktverwaltung</h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Adressen & Sonstiges</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500 font-medium">{adressen.length} Adressen gespeichert</span>
                <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">+ Adresse hinzufügen</button>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px]">Name / Firma</th>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px]">Kontakt</th>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px]">Rolle</th>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px] text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {adressen.map(adr => (
                      <tr key={adr.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-gray-800">{adr.anrede} {adr.nachname} {adr.vorname}</div>
                          <div className="text-gray-500 text-[10px]">{adr.firma || '-'}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-blue-600 truncate max-w-[150px]">{adr.email || '-'}</div>
                          <div className="text-gray-400 text-[10px]">{adr.handy || adr.telefon || '-'}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            adr.rolle === 'Mandant' ? 'bg-green-50 text-green-700 border-green-100' :
                            adr.rolle === 'Berater' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-gray-50 text-gray-700 border-gray-100'
                          }`}>{adr.rolle}</span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end items-center gap-1">
                            {deleteConfirmId === adr.id ? (
                              <div className="flex items-center gap-1 animate-in zoom-in duration-200">
                                <button onClick={() => handleDelete(adr.id)} className="bg-red-600 text-white px-2 py-1 rounded text-[9px] font-bold hover:bg-red-700">LÖSCHEN?</button>
                                <button onClick={() => setDeleteConfirmId(null)} className="p-1 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                              </div>
                            ) : (
                              <>
                                <button onClick={() => handleEdit(adr)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                                <button onClick={() => handleDelete(adr.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Basisdaten</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Rolle *</label>
                      <select value={currentEdit?.rolle} onChange={(e) => setCurrentEdit({...currentEdit!, rolle: e.target.value as RolleAdresse})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all">
                        {ADRESS_ROLLEN.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Anrede {currentEdit?.firma?.trim() ? '(Optional)' : '*'}</label>
                      <select value={currentEdit?.anrede || ''} onChange={(e) => setCurrentEdit({...currentEdit!, anrede: e.target.value})} className={`w-full bg-white border ${errors.anrede ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all`}>
                        <option value="">-- Keine Angabe --</option>
                        <option value="Herr">Herr</option>
                        <option value="Frau">Frau</option>
                        <option value="Firma">Firma</option>
                      </select>
                      {errors.anrede && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.anrede}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Firma (Optional, ersetzt Nachname & Anrede als Pflichtfeld)</label>
                    <input type="text" value={currentEdit?.firma} onChange={(e) => setCurrentEdit({...currentEdit!, firma: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" placeholder="Muster GmbH" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nachname {currentEdit?.firma?.trim() ? '(Optional)' : '*'}</label>
                      <input type="text" value={currentEdit?.nachname} onChange={(e) => setCurrentEdit({...currentEdit!, nachname: e.target.value})} className={`w-full bg-white border ${errors.nachname ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all`} placeholder="Mustermann" />
                      {errors.nachname && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.nachname}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Vorname</label>
                      <input type="text" value={currentEdit?.vorname} onChange={(e) => setCurrentEdit({...currentEdit!, vorname: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" placeholder="Max" />
                    </div>
                  </div>
                </div>

                <div className={`bg-blue-50/30 p-4 rounded-xl space-y-4 border ${errors.kontakt ? 'border-red-500 bg-red-50/30' : 'border-blue-100/50'} shadow-sm transition-colors`}>
                  <div className="flex justify-between items-center">
                    <h4 className={`text-[10px] font-black ${errors.kontakt ? 'text-red-500' : 'text-gray-400'} uppercase tracking-[0.2em]`}>
                      Kontaktinformationen 
                      <span className={`ml-2 normal-case font-bold ${errors.kontakt ? 'text-red-600' : 'text-blue-400/70'}`}>
                        (Mindestens eine Telefonnummer erforderlich)
                      </span>
                    </h4>
                  </div>
                  
                  {/* Neue Adressfelder vor Email/Website */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PLZ & Ort</label>
                      <input type="text" value={currentEdit?.plzOrt || ''} onChange={(e) => setCurrentEdit({...currentEdit!, plzOrt: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" placeholder="12345 Musterstadt" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Strasse & Hausnummer</label>
                      <input type="text" value={currentEdit?.strasseHausnummer || ''} onChange={(e) => setCurrentEdit({...currentEdit!, strasseHausnummer: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" placeholder="Musterstraße 1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Emailadresse</label>
                      <input type="email" value={currentEdit?.email} onChange={(e) => setCurrentEdit({...currentEdit!, email: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" placeholder="max@mustermann.de" />
                      {errors.email && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Website (optional)</label>
                      <input type="text" value={currentEdit?.website} onChange={(e) => setCurrentEdit({...currentEdit!, website: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" placeholder="www.beispiel.de" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Handynummer</label>
                      <input type="tel" value={currentEdit?.handy} onChange={(e) => setCurrentEdit({...currentEdit!, handy: e.target.value})} className={`w-full bg-white border ${errors.kontakt ? 'border-red-300' : 'border-gray-200'} rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all`} placeholder="0170 1234567" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Weitere Telefonnummer</label>
                      <input type="tel" value={currentEdit?.telefon} onChange={(e) => setCurrentEdit({...currentEdit!, telefon: e.target.value})} className={`w-full bg-white border ${errors.kontakt ? 'border-red-300' : 'border-gray-200'} rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all`} placeholder="030 123456" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Notitz</label>
                    <textarea 
                      value={currentEdit?.notiz || ''} 
                      onChange={(e) => setCurrentEdit({...currentEdit!, notiz: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all min-h-[80px] resize-y" 
                      placeholder="Besondere Erreichbarkeit, Abteilung, interne Vermerke..." 
                    />
                  </div>
                </div>

                {/* Verbindungen Block */}
                <div className="bg-blue-50/30 p-4 rounded-xl space-y-4 border border-blue-100 shadow-sm">
                  <div className="flex justify-between items-center border-b border-blue-100 pb-2 mb-2">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Verbindungen</h4>
                    {!connectionEditMode && (
                      <button 
                        type="button" 
                        onClick={handleAddConnection}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-3 py-1 rounded shadow-sm transition-all uppercase"
                      >
                        + Neu
                      </button>
                    )}
                  </div>

                  {/* Liste der bestehenden Verbindungen */}
                  <div className="space-y-2">
                    {currentEdit?.verbindungen?.length ? currentEdit.verbindungen.map(conn => {
                      const ziel = adressen.find(a => a.id === conn.zielAdresseId);
                      const isBeingEdited = currentConnEdit?.id === conn.id;
                      const isBeingDeleted = deleteConnConfirmId === conn.id;
                      
                      return (
                        <div key={conn.id} className={`flex justify-between items-center bg-white border ${isBeingEdited ? 'border-blue-400 ring-1 ring-blue-100' : isBeingDeleted ? 'border-red-400 ring-1 ring-red-100' : 'border-gray-100'} p-2 rounded-lg text-xs transition-all`}>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600">{conn.art}:</span>
                            <span className="text-gray-700">
                              {ziel ? (ziel.firma || `${ziel.vorname} ${ziel.nachname}`) : 'Unbekannter Kontakt'}
                            </span>
                          </div>
                          
                          <div className="flex gap-1">
                            {isBeingDeleted ? (
                              <div className="flex items-center gap-1 animate-in zoom-in duration-200">
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteConnection(conn.id)} 
                                  className="bg-red-600 text-white px-2 py-1 rounded text-[9px] font-bold hover:bg-red-700"
                                >
                                  LÖSCHEN?
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setDeleteConnConfirmId(null)} 
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  type="button" 
                                  onClick={() => handleEditConnection(conn)} 
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-100"
                                  title="Bearbeiten"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteConnection(conn.id)} 
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors border border-transparent hover:border-red-100"
                                  title="Löschen"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }) : !connectionEditMode && (
                      <div className="text-[10px] text-gray-400 italic text-center py-2">Keine Verbindungen hinterlegt.</div>
                    )}
                  </div>

                  {/* Eingabemaske für Neu/Bearbeiten */}
                  {connectionEditMode && (
                    <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-4 shadow-md animate-in slide-in-from-top-2 duration-200 mt-2">
                      <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          {currentConnEdit?.id ? 'Verbindung bearbeiten' : 'Neue Verbindung erstellen'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name (Kontakt wählen) *</label>
                          <select 
                            required
                            value={currentConnEdit?.zielAdresseId || ''}
                            onChange={(e) => setCurrentConnEdit({...currentConnEdit!, zielAdresseId: parseInt(e.target.value)})}
                            className={`w-full bg-transparent border ${connErrors.zielAdresseId ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                          >
                            <option value="">-- Kontakt wählen --</option>
                            {adressen
                              .filter(a => a.id !== currentEdit?.id)
                              .map(a => (
                                <option key={a.id} value={a.id}>{a.firma ? `${a.firma} (${a.nachname})` : `${a.anrede} ${a.vorname} ${a.nachname}`}</option>
                              ))
                            }
                          </select>
                          {connErrors.zielAdresseId && <p className="text-[9px] text-red-500 mt-1 font-bold">{connErrors.zielAdresseId}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Art der Verbindung *</label>
                          <input 
                            type="text" 
                            required
                            value={currentConnEdit?.art || ''}
                            onChange={(e) => setCurrentConnEdit({...currentConnEdit!, art: e.target.value})}
                            className={`w-full bg-transparent border ${connErrors.art ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
                            placeholder="z.B. Ehepartner, Steuerberater"
                          />
                          {connErrors.art && <p className="text-[9px] text-red-500 mt-1 font-bold">{connErrors.art}</p>}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                        <button type="button" onClick={() => { setConnectionEditMode(false); setCurrentConnEdit(null); setConnErrors({}); }} className="text-[10px] font-bold text-gray-400 px-3 py-1 hover:text-gray-600 transition-colors">Abbrechen</button>
                        <button type="button" onClick={() => handleSaveConnection()} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-1.5 rounded shadow-sm transition-all">Verbindung speichern</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-100 p-4 rounded-xl space-y-3 border border-gray-200 shadow-inner">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">System-Informationen</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Erstanlage</label>
                      <input type="text" value={formatDateTime(currentEdit?.erstanlage)} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] text-gray-500 cursor-not-allowed outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Letzte Änderung</label>
                      <input type="text" value={formatDateTime(currentEdit?.letzteAenderung)} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] text-gray-500 cursor-not-allowed outline-none font-mono" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center pt-4 border-t border-gray-100">
                  <button type="submit" className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors">Speichern</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManagementModal;
