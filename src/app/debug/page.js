'use client';

import { useState, useEffect } from 'react';
import { getUser } from '@/utils/auth';
import { storageUtils } from '@/utils/storage';

export default function DebugPage() {
  const [user, setUser] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [testEntry, setTestEntry] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user data
    const userData = getUser();
    setUser(userData);
    console.log('Current user:', userData);

    // Load journal entries
    const savedEntries = storageUtils.getJournalEntries();
    console.log(`Loaded ${savedEntries.length} journal entries`);
    setJournalEntries(savedEntries);
  }, []);

  const addTestEntry = () => {
    if (!testEntry.trim()) return;

    const newEntry = {
      id: Date.now(),
      content: testEntry,
      date: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      mood: 'happy', // Explicitly set mood for testing
      sleep: {
        hours: 8, // Explicitly set sleep data for testing
        quality: 'good'
      },
      exercise: {
        minutes: 45, // Explicitly set exercise data for testing
        type: 'running'
      }
    };

    console.log('Adding test entry:', newEntry);
    const updatedEntries = storageUtils.addJournalEntry(newEntry);
    setJournalEntries(updatedEntries);
    setTestEntry('');
  };

  const testAnalyze = async () => {
    if (journalEntries.length === 0) {
      setError('Please add at least one journal entry first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      console.log(`Testing analyze API with ${journalEntries.length} entries`);
      console.log('First entry:', journalEntries[0]);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entries: journalEntries }),
        credentials: 'include'
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          setError(`API error: ${errorData.error || response.statusText}`);
        } catch (jsonError) {
          setError(`API error: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const result = await response.json();
      console.log('Analysis result:', result);
      setAnalysisResult(result);

      // Save the analysis
      storageUtils.saveAnalysis(result);
    } catch (error) {
      console.error('Test analyze error:', error);
      setError(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearEntries = () => {
    if (confirm('Are you sure you want to clear all journal entries?')) {
      storageUtils.saveJournalEntries([]);
      setJournalEntries([]);
      console.log('Cleared all journal entries');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Info</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Test Journal Entry</h2>
        <textarea
          value={testEntry}
          onChange={(e) => setTestEntry(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4"
          rows="3"
          placeholder="Write a test journal entry..."
        />
        <div className="flex gap-4">
          <button
            onClick={addTestEntry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!testEntry.trim()}
          >
            Add Entry
          </button>
          <button
            onClick={clearEntries}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All Entries
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Journal Entries ({journalEntries.length})</h2>
        <div className="bg-gray-100 p-4 rounded overflow-auto max-h-60 mb-4">
          {journalEntries.length > 0 ? (
            <pre>{JSON.stringify(journalEntries, null, 2)}</pre>
          ) : (
            <p className="text-gray-500">No journal entries yet</p>
          )}
        </div>
        <button
          onClick={testAnalyze}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={loading || journalEntries.length === 0}
        >
          {loading ? 'Analyzing...' : 'Test Analyze API'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {analysisResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(analysisResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
