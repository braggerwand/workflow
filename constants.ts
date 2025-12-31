
import { StatusRolle, RolleBenutzer, RolleAdresse, AktionArt } from './types';

export const STATUS_OPTIONEN: StatusRolle[] = [
  'Erstanfrage',
  'Aquisekommunikation',
  'Vertragserstellung',
  'Unterlagen anfordern',
  'Ortsbesichtigung vereinbaren',
  'Ortsbesichtigung vorbereiten',
  'Ortsbesichtigung durchführen',
  'Ausarbeitung Entwurf',
  'Entwurfsprüfung',
  'Korrekturlesen',
  'Versand',
  'Rückfragen'
];

export const AKTION_ARTEN: AktionArt[] = [
  'Post (Eingang)',
  'Post (Ausgang)',
  'Email (Eingang)',
  'Email (Ausgang)',
  'Telefonat (Eingang)',
  'Telefonat (Ausgang)',
  'Notiz'
];

export const BENUTZER_ROLLEN: RolleBenutzer[] = ['Inhaber', 'Backoffice', 'Gutachter'];
export const ADRESS_ROLLEN: RolleAdresse[] = ['Mandant', 'Berater', 'Sonstiges'];

export const STATUS_FARBEN: Record<StatusRolle, string> = {
  'Erstanfrage': '#FFFFFF',               
  'Aquisekommunikation': '#FFFEF2',      
  'Vertragserstellung': '#FFFDE6',       
  'Unterlagen anfordern': '#FFFCD9',     
  'Ortsbesichtigung vereinbaren': '#FFFDE0', 
  'Ortsbesichtigung vorbereiten': '#FFFBCC', 
  'Ortsbesichtigung durchführen': '#FFF9BF', 
  'Ausarbeitung Entwurf': '#FFF8B2',     
  'Entwurfsprüfung': '#FFF7A5',          
  'Korrekturlesen': '#FFF698',           
  'Versand': '#FFF58B',                  
  'Rückfragen': '#FFF47E'                
};
