
import React, { useState } from 'react';
import { Benutzer, RolleBenutzer } from '../types';
import { BENUTZER_ROLLEN } from '../constants';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  benutzer: Benutzer[];
  setBenutzer: React.Dispatch<React.SetStateAction<Benutzer[]>>;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  benutzer, 
  setBenutzer 
}) => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [currentEdit, setCurrentEdit] = useState<Partial<Benutzer> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ email?: string; telefon?: string }>({});

  if (!isOpen) return null;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\+?[0-9\s\-()\/]{7,25}$/;

  const validate = (): boolean => {
    const newErrors: { email?: string; telefon?: string } = {};
    if (currentEdit?.email && !emailRegex.test(currentEdit.email)) newErrors.email = 'Ungültiges Email-Format';
    if (currentEdit?.telefon && !phoneRegex.test(currentEdit.telefon)) newErrors.telefon = 'Ungültige Nummer';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNew = () => {
    setCurrentEdit({ vorname: '', nachname: '', rolle: 'Gutachter', farbe: '#2563eb', email: '', telefon: '' });
    setErrors({});
    setView('edit');
  };

  const handleEdit = (u: Benutzer) => {
    setCurrentEdit(u);
    setErrors({});
    setView('edit');
  };

  const handleDelete = (id: number) => {
    if (deleteConfirmId === id) {
      setBenutzer(prev => prev.filter(u => u.id !== id));
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEdit) return;
    if (!validate()) return;

    if (currentEdit.id) {
      setBenutzer(prev => prev.map(u => u.id === currentEdit.id ? (currentEdit as Benutzer) : u));
    } else {
      setBenutzer(prev => {
        const maxId = prev.reduce((max, u) => (u.id > max ? u.id : max), 0);
        return [...prev, { ...currentEdit, id: maxId + 1 } as Benutzer];
      });
    }
    setView('list');
    setCurrentEdit(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Bearbeiterverwaltung</h3>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Teammitglieder & Rollen</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {view === 'list' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500 font-medium">{benutzer.length} registrierte Bearbeiter</span>
                <button 
                  onClick={handleAddNew} 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-5 rounded-lg shadow-md transition-all active:scale-95"
                >
                  + Bearbeiter hinzufügen
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="p-4 uppercase text-[9px] w-12 font-black tracking-widest">Punkt</th>
                      <th className="p-4 uppercase text-[9px] font-black tracking-widest">Name</th>
                      <th className="p-4 uppercase text-[9px] font-black tracking-widest">Rolle</th>
                      <th className="p-4 uppercase text-[9px] font-black tracking-widest text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {benutzer.map(u => (
                      <tr key={u.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-4">
                          <div className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: u.farbe }}></div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-800 text-sm">{u.nachname}, {u.vorname}</div>
                          <div className="text-[10px] text-blue-500 font-medium">{u.email || 'Keine E-Mail'}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border bg-gray-50 border-gray-200 text-gray-600">
                            {u.rolle}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {deleteConfirmId === u.id ? (
                              <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
                                <button onClick={() => handleDelete(u.id)} className="bg-red-600 text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-red-700 shadow-sm">JETZT LÖSCHEN</button>
                                <button onClick={() => setDeleteConfirmId(null)} className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-md">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Bearbeiten">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                </button>
                                {u.id !== 1 && (
                                  <button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Löschen">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                )}
                              </div>
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
            <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gray-50 p-5 rounded-2xl space-y-5 border border-gray-100 shadow-inner">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Personalien & Stammdaten</h4>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1">Nachname *</label>
                    <input 
                      type="text" 
                      value={currentEdit?.nachname} 
                      onChange={(e) => setCurrentEdit({...currentEdit!, nachname: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1">Vorname *</label>
                    <input 
                      type="text" 
                      value={currentEdit?.vorname} 
                      onChange={(e) => setCurrentEdit({...currentEdit!, vorname: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1">E-Mail Adresse *</label>
                    <input 
                      type="email" 
                      value={currentEdit?.email} 
                      onChange={(e) => setCurrentEdit({...currentEdit!, email: e.target.value})} 
                      className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm`} 
                      placeholder="name@kanzlei.de"
                      required 
                    />
                    {errors.email && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.email}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1">Ident-Farbe</label>
                    <div className="flex gap-3 items-center bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                      <input 
                        type="color" 
                        value={currentEdit?.farbe} 
                        onChange={(e) => setCurrentEdit({...currentEdit!, farbe: e.target.value})} 
                        className="h-8 w-14 border-0 bg-transparent cursor-pointer rounded overflow-hidden" 
                      />
                      <span className="text-xs font-mono text-gray-400 font-bold tracking-widest">{currentEdit?.farbe?.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1">Kanzlei-Rolle *</label>
                  <select 
                    value={currentEdit?.rolle} 
                    onChange={(e) => setCurrentEdit({...currentEdit!, rolle: e.target.value as RolleBenutzer})} 
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    {BENUTZER_ROLLEN.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  className="px-12 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Speichern
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;
