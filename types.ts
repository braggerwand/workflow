
export type RolleBenutzer = 'Inhaber' | 'Backoffice' | 'Gutachter';
export type RolleAdresse = 'Mandant' | 'Berater' | 'Sonstiges';
export type StatusRolle = 
  | 'Erstanfrage' 
  | 'Aquisekommunikation' 
  | 'Vertragserstellung' 
  | 'Unterlagen anfordern' 
  | 'Ortsbesichtigung vereinbaren'
  | 'Ortsbesichtigung vorbereiten' 
  | 'Ortsbesichtigung durchführen' 
  | 'Ausarbeitung Entwurf' 
  | 'Entwurfsprüfung' 
  | 'Korrekturlesen' 
  | 'Versand' 
  | 'Rückfragen';

export type AktionArt = 
  | 'Post (Eingang)'
  | 'Post (Ausgang)'
  | 'Email (Eingang)'
  | 'Email (Ausgang)'
  | 'Telefonat (Eingang)'
  | 'Telefonat (Ausgang)'
  | 'Notiz';

export type Prioritaet = 'niedrig' | 'normal' | 'hoch';

export interface Verbindung {
  id: number;
  art: string;
  zielAdresseId: number;
}

export interface TaskAktion {
  id: number;
  datum: string; // ISO String für Datum und Uhrzeit
  art: AktionArt;
  ansprechpartner: string; // Externer Kontakt
  ansprechpartnerInternId: number; // Neu: Interner Bearbeiter
  beschreibung: string;
}

export interface Benutzer {
  id: number;
  vorname: string;
  nachname: string;
  rolle: RolleBenutzer;
  farbe: string; // Hex-Code
  email?: string;
  telefon?: string;
}

export interface Adresse {
  id: number;
  anrede: string;
  vorname: string;
  nachname: string;
  firma: string;
  rolle: RolleAdresse;
  plzOrt?: string;            // Neu: Postleitzahl und Ort
  strasseHausnummer?: string; // Neu: Straße und Hausnummer
  email?: string;
  handy?: string;
  telefon?: string;
  website?: string;
  notiz?: string; // Neu: Notiz zum Kontakt
  erstanlage: string;      // Zeitstempel der Erstellung
  letzteAenderung: string; // Zeitstempel der letzten Bearbeitung
  verbindungen?: Verbindung[]; // Liste verknüpfter Kontakte
}

export interface StatusEntry {
  id: number;
  rolle: StatusRolle;
  farbe: string; // Hex-Code
}

export interface Task {
  id: number;
  statusId: number; 
  mandantId: number; 
  sonstigeId?: number; 
  prioritaet: Prioritaet; 
  objekttyp: string;
  objektadresse: {
    plzOrt: string;
    strasseHausnummer: string;
  };
  zweck: string;
  stichtag: string;
  grundhonorar: number;
  abgerechnetesHonorar: number;
  hinweis: string;
  benutzerId: number; 
  taskRolle: StatusRolle;
  aktionen: TaskAktion[];
  erstanlage: string;      // Zeitstempel der Erstellung
  letzteAenderung: string; // Zeitstempel der letzten Bearbeitung
}
