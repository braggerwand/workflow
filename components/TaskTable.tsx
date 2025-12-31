
import React from 'react';
import { Task, Adresse, Benutzer, StatusEntry, Prioritaet } from '../types';
import { SortField, SortDirection } from './Workbench';

interface TaskTableProps {
  tasks: Task[];
  adressen: Adresse[];
  benutzer: Benutzer[];
  statusListe: StatusEntry[];
  selectedTaskId: number | null;
  onSelectTask: (id: number) => void;
  onOpenTask: (id: number) => void;
  onSort: (field: SortField) => void;
  sortConfig: { field: SortField, direction: SortDirection };
}

const TaskTable: React.FC<TaskTableProps> = ({ 
  tasks, 
  adressen, 
  benutzer, 
  statusListe, 
  selectedTaskId, 
  onSelectTask,
  onOpenTask,
  onSort,
  sortConfig
}) => {
  
  const getContrastColor = (hexcolor: string | undefined) => {
    if (!hexcolor) return 'text-gray-900';
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'text-gray-900' : 'text-white';
  };

  const getSecondaryTextColor = (hexcolor: string | undefined) => {
    if (!hexcolor) return 'text-gray-500';
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'text-gray-500' : 'text-gray-200';
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) return <span className="ml-1 opacity-20 text-[8px]">⇅</span>;
    return <span className="ml-1 text-blue-600 font-black">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const HeaderCell = ({ label, field, className = "" }: { label: string, field: SortField, className?: string }) => (
    <th 
      onClick={() => onSort(field)}
      className={`p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-blue-50/50 hover:text-blue-600 transition-all select-none group/h ${className}`}
    >
      <div className="flex items-center">
        {label}
        <SortIndicator field={field} />
      </div>
    </th>
  );

  const getPriorityLabel = (p: Prioritaet | undefined) => {
    if (p === 'hoch') return '!!!';
    if (p === 'niedrig') return 'v';
    return '-';
  };

  const getPriorityColor = (p: Prioritaet | undefined, statusColor: string | undefined) => {
      const isDarkStatus = statusColor && getContrastColor(statusColor) === 'text-white';
      if (p === 'hoch') return isDarkStatus ? 'text-red-200' : 'text-red-600';
      if (p === 'niedrig') return isDarkStatus ? 'text-green-200' : 'text-green-600';
      return isDarkStatus ? 'text-white/50' : 'text-gray-400';
  };

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-250px)] selection:bg-blue-600 selection:text-white border-t border-gray-100">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-white shadow-sm z-20">
          <tr className="border-b border-gray-200">
            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-8">Prio</th>
            <HeaderCell label="Name" field="nachname" />
            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vorname</th>
            <HeaderCell label="Firma" field="firma" />
            <HeaderCell label="Objekttyp" field="objekttyp" />
            <HeaderCell label="PLZ & Ort" field="plzOrt" />
            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Objektadresse</th>
            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Zweck</th>
            <HeaderCell label="Status" field="status" className="text-center" />
            <HeaderCell label="Bearbeiter" field="bearbeiter" />
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={10} className="p-8 text-center text-gray-400 text-xs italic bg-white">Keine Projekte vorhanden</td>
            </tr>
          ) : (
            tasks.map((task) => {
              const mandant = adressen.find(a => a.id === task.mandantId);
              const status = statusListe.find(s => s.id === task.statusId);
              const user = benutzer.find(u => u.id === task.benutzerId);
              const isSelected = selectedTaskId === task.id;
              
              const textColor = getContrastColor(status?.farbe);
              const secondaryColor = getSecondaryTextColor(status?.farbe);
              const badgeBg = (getContrastColor(status?.farbe) === 'text-white') ? 'bg-white/20' : 'bg-black/5';

              return (
                <tr 
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  onDoubleClick={() => onOpenTask(task.id)}
                  className={`
                    group cursor-pointer border-b border-gray-100 transition-all
                    ${isSelected ? 'ring-2 ring-blue-500 ring-inset shadow-xl z-10 relative brightness-[1.02]' : 'hover:brightness-98'}
                  `}
                  style={{ backgroundColor: status?.farbe || '#ffffff' }}
                >
                  <td className={`p-3 text-center font-black text-[10px] ${getPriorityColor(task.prioritaet, status?.farbe)}`}>
                    {getPriorityLabel(task.prioritaet)}
                  </td>
                  <td className={`p-3 text-xs font-bold ${textColor}`}>
                    {mandant?.nachname || '-'}
                  </td>
                  <td className={`p-3 text-xs ${textColor}`}>
                    {mandant?.vorname || '-'}
                  </td>
                  <td className={`p-3 text-xs font-semibold ${textColor}`}>
                    {mandant?.firma || '-'}
                  </td>
                  <td className={`p-3 text-xs ${secondaryColor}`}>{task.objekttyp}</td>
                  <td className={`p-3 text-xs ${secondaryColor}`}>{task.objektadresse.plzOrt}</td>
                  <td className={`p-3 text-xs ${secondaryColor}`}>{task.objektadresse.strasseHausnummer}</td>
                  <td className={`p-3 text-xs ${secondaryColor} max-w-[120px] truncate`}>{task.zweck}</td>
                  <td className="p-3 text-xs text-center">
                    <span className={`px-2 py-0.5 rounded-full ${badgeBg} text-[9px] font-bold uppercase tracking-tight whitespace-nowrap ${textColor} border border-black/5`}>
                      {status?.rolle}
                    </span>
                  </td>
                  <td className={`p-3 text-xs font-medium ${textColor}`}>
                    {user ? `${user.vorname} ${user.nachname}` : 'N/A'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
