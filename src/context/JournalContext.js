// src/context/JournalContext.js
'use client';
import { createContext, useContext, useState } from 'react';

const JournalContext = createContext();

export function JournalProvider({ children }) {
  const [journalData, setJournalData] = useState([]);

  return (
    <JournalContext.Provider value={{ journalData, setJournalData }}>
      {children}
    </JournalContext.Provider>
  );
}

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};