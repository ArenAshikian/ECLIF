import React, { useState } from 'react';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [explanationStyle, setExplanationStyle] = useState('child');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('explanationHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeView, setActiveView] = useState('main'); // 'main' or 'detail'
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter some code.');
      setExplanation('');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/explain_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, style: explanationStyle }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setExplanation('');
      } else {
        setExplanation(data.explanation);
        const newEntry = {
          id: Date.now(),
          code,
          explanation: data.explanation,
          time: new Date().toLocaleString(),
        };
        const updated = [newEntry, ...history.slice(0, 9)];
        setHistory(updated);
        localStorage.setItem('explanationHistory', JSON.stringify(updated));
      }
    } catch (err) {
      setError('Failed to fetch explanation. Try again later.');
      setExplanation('');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (entry) => {
    setSelectedEntry(entry);
    setActiveView('detail');
  };

  const handleClearHistory = () => {
    localStorage.removeItem('explanationHistory');
    setHistory([]);
    setCode('');
    setExplanation('');
    setActiveView('main');
    setSelectedEntry(null);
  };

  const handleBack = () => {
    setActiveView('main');
    setSelectedEntry(null);
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <h3>History</h3>
        <button onClick={handleClearHistory} className="clear-btn">
          Clear
        </button>
        {history.length === 0 && <p className="no-history">No entries yet.</p>}
        {history.map((entry) => (
          <button
            key={entry.id}
            className="tab"
            onClick={() => handleHistoryClick(entry)}
            title={entry.code}
          >
            {entry.time}
          </button>
        ))}
      </div>

      <div className="App">
        {activeView === 'main' ? (
          <>
            <h1>Explain Code Like I'm Five</h1>

            <textarea
              rows={12}
              cols={80}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              value={code}
            />

            <div style={{ margin: '10px 0' }}>
              <label>
                <strong>Explanation Style:</strong>
              </label>
              <select
                value={explanationStyle}
                onChange={(e) => setExplanationStyle(e.target.value)}
              >
                <option value="child">Like I'm 5 🧒</option>
                <option value="cs">Like I'm a CS student 👨‍💻</option>
              </select>
            </div>

            <button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  Explaining
                  <span className="loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </>
              ) : (
                'Explain'
              )}
            </button>

            {error && <p className="error">{error}</p>}

            {explanation && (
              <div className="output">
                <h2>Explanation:</h2>
                <p>{explanation}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <button className="back-btn" onClick={handleBack}>
              ← Back
            </button>
            <div className="output">
              <h2>Code:</h2>
              <pre>{selectedEntry.code}</pre>
              <h2>Explanation:</h2>
              <p>{selectedEntry.explanation}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
