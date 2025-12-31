
import React, { useState } from 'react';
import { StatusEntry, StatusRolle } from '../types';

interface StatusManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusListe: StatusEntry[];
  setStatusListe: React.Dispatch<React.SetStateAction<StatusEntry[]>>;
}

type PositionType = 'START' | 'END' | 'BEFORE' | 'AFTER';

const StatusManagementModal: React.FC<StatusManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  statusListe, 
  setStatusListe 
}) => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [currentEdit, setCurrentEdit] = useState<Partial<StatusEntry> & { position?: PositionType, targetId?: number } | null>(null);

  if (!isOpen) return null;

  const handleAddNew = () => {
    setCurrentEdit({
      rolle: '' as StatusRolle,
      farbe: '#ffffff',
      position: 'END',
      targetId: statusListe[0]?.id
    });
    setView('edit');
  };

  const handleEdit = (status: StatusEntry) => {
    setCurrentEdit(status);
    setView('edit');
  };

  const handleDelete = (id: number) => {
    if (confirm('Möchten Sie diesen Status wirklich löschen? Dies kann Auswirkungen auf bestehende Projekte haben.')) {
      setStatusListe(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEdit) return;

    if (currentEdit.id) {
      // Bestehendes Update
      setStatusListe(prev => prev.map(s => s.id === currentEdit.id ? { id: s.id, rolle: currentEdit.rolle as StatusRolle, farbe: currentEdit.farbe! } : s));
    } else {
      // Neuanlage mit Positionslogik
      const newId = Math.max(0, ...statusListe.map(s => s.id)) + 1;
      const newStatus: StatusEntry = {
        id: newId,
        rolle: currentEdit.rolle as StatusRolle,
        farbe: currentEdit.farbe!
      };

      setStatusListe(prev => {
        const list = [...prev];
        const { position, targetId } = currentEdit;

        if (position === 'START') {
          return [newStatus, ...list];
        } else if (position === 'END') {
          return [...list, newStatus];
        } else if (position === 'BEFORE' && targetId) {
          const index = list.findIndex(s => s.id === targetId);
          list.splice(index, 0, newStatus);
          return list;
        } else if (position === 'AFTER' && targetId) {
          const index = list.findIndex(s => s.id === targetId);
          list.splice(index + 1, 0, newStatus);
          return list;
        }
        return [...list, newStatus];
      });
    }
    setView('list');
    setCurrentEdit(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Statusverwaltung</h3>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Workflow-Phasen konfigurieren</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500 font-medium">{statusListe.length} Phasen definiert</span>
                <button 
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
                >
                  + Neuer Status
                </button>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px] w-12">Farbe</th>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px]">Bezeichnung</th>
                      <th className="p-3 font-bold text-gray-400 uppercase text-[9px] text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {statusListe.map((s, index) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-3">
                          <div className="w-6 h-6 rounded border border-gray-200 shadow-sm" style={{ backgroundColor: s.farbe }}></div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] text-gray-300 font-mono">#{index + 1}</span>
                             <span className="font-semibold text-gray-700">{s.rolle}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button onClick={() => handleEdit(s)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                          <button onClick={() => handleDelete(s.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status-Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Bezeichnung</label>
                    <input 
                      type="text" 
                      value={currentEdit?.rolle}
                      onChange={(e) => setCurrentEdit({...currentEdit!, rolle: e.target.value as StatusRolle})}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                      placeholder="z.B. Archiviert"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Farbe</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={currentEdit?.farbe}
                        onChange={(e) => setCurrentEdit({...currentEdit!, farbe: e.target.value})}
                        className="h-8 w-12 border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{currentEdit?.farbe}</span>
                    </div>
                  </div>
                </div>

                {!currentEdit?.id && (
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Positionierung</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Einfügen...</label>
                        <select 
                          value={currentEdit?.position}
                          onChange={(e) => setCurrentEdit({...currentEdit!, position: e.target.value as PositionType})}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                        >
                          <option value="START">am Anfang</option>
                          <option value="END">am Ende</option>
                          <option value="BEFORE">vor einem Element</option>
                          <option value="AFTER">nach einem Element</option>
                        </select>
                      </div>
                      {(currentEdit?.position === 'BEFORE' || currentEdit?.position === 'AFTER') && (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Referenz-Status</label>
                          <select 
                            value={currentEdit?.targetId}
                            onChange={(e) => setCurrentEdit({...currentEdit!, targetId: parseInt(e.target.value)})}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                          >
                            {statusListe.map(s => <option key={s.id} value={s.id}>{s.rolle}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setView('list')} className="px-6 py-2 text-xs font-bold text-gray-500">Abbrechen</button>
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md">Speichern</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusManagementModal;
