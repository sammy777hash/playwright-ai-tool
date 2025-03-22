import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [logs, setLogs] = useState([]);
  const [lang, setLang] = useState('en');
  const [testId, setTestId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const runTest = async () => {
    try {
      const { data } = await axios.post('http://localhost:3000/api/test', { prompt });
      setTestId(data.testId);
      setLogs(data.steps);
      fetchComments(data.testId);
    } catch (error) {
      setLogs([{ step: `Error: ${error.message}`, timestamp: Date.now() }]);
    }
  };

  const speak = () => {
    const recognition = new window.SpeechRecognition();
    recognition.lang = lang;
    recognition.onresult = (e) => setPrompt(e.results[0][0].transcript);
    recognition.onerror = (e) => console.log('Speech error:', e.error);
    recognition.start();
  };

  const fetchComments = async (id) => {
    if (!id) return;
    const { data } = await axios.get(`http://localhost:3000/api/comments/${id}`);
    setComments(data);
  };

  const addComment = async () => {
    if (!testId || !newComment) return;
    const { data } = await axios.post('http://localhost:3000/api/comments', { testId, comment: newComment });
    setComments(data);
    setNewComment('');
  };

  useEffect(() => {
    if (testId) fetchComments(testId);
  }, [testId]);

  const translations = {
    en: { run: 'Run', speak: '🎙️ Speak', comment: 'Add Comment' },
    es: { run: 'Ejecutar', speak: '🎙️ Hablar', comment: 'Agregar Comentario' }
  };
  const t = translations[lang] || translations.en;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Playwright AI Tool</h1>
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>
      <br />
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter test prompt"
        style={{ width: '300px', margin: '10px 0' }}
      />
      <br />
      <button onClick={speak}>{t.speak}</button>
      <button onClick={runTest}>{t.run}</button>
      <pre style={{ background: '#f0f0f0', padding: '10px', maxHeight: '400px', overflow: 'auto' }}>
        {JSON.stringify(logs, null, 2)}
      </pre>
      {logs.map((log, i) => (
        log.screenshot && (
          <div key={i}>
            <h3>{log.step}</h3>
            <img src={`/${log.screenshot}`} alt={log.step} style={{ maxWidth: '300px' }} />
            {log.diff && (
              <div>
                <p>Visual difference detected: {log.diff.numDiffPixels} pixels</p>
                <img src={`/${log.diff.diffPath}`} alt="Diff" style={{ maxWidth: '300px' }} />
              </div>
            )}
          </div>
        )
      ))}
      {logs.some(log => log.analytics) && (
        <div>
          <h3>Predictive Analytics</h3>
          <p>Error Rate: {logs.find(log => log.analytics).analytics.errorRate.toFixed(2)}%</p>
          <p>Flaky Steps: {logs.find(log => log.analytics).analytics.flakySteps.join(', ') || 'None'}</p>
        </div>
      )}
      {testId && (
        <div>
          <h3>Collaboration</h3>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment"
            style={{ width: '300px', margin: '10px 0' }}
          />
          <button onClick={addComment}>{t.comment}</button>
          <ul>
            {comments.map((c, i) => (
              <li key={i}>{c.comment} (at {new Date(c.timestamp).toLocaleString()})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;