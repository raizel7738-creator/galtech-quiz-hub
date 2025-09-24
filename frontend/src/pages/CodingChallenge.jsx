import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { challengesAPI, judge0API, codingSubmissionAPI } from '../services/api'; // <-- import codingSubmissionAPI

const LANGUAGE_OPTIONS = [
  { id: 63, name: 'JavaScript (Node.js)', value: 'javascript' },
  { id: 71, name: 'Python (3.8+)', value: 'python' },
  { id: 62, name: 'Java (OpenJDK)', value: 'java' },
  { id: 54, name: 'C++ (GCC 9.2)', value: 'cpp' },
];

const CodingChallenge = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [language, setLanguage] = useState(63);
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await challengesAPI.get(id);
      const data = res.data || res;
      setChallenge(data);
      setLanguage((data.languages && data.languages[0]) || 63);
      setCode(data.starterCode || '');
    })();
  }, [id]);

  const onRun = async () => {
    try {
      setRunning(true);
      const res = await judge0API.run({ language_id: language, source_code: code, stdin });
      const d = res?.data || {};
      const combined = [d.stdout, d.compile_output, d.stderr, d.message]
        .filter(Boolean)
        .join('\n')
        .trim();
      setOutput(combined || 'No output');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Run failed';
      const code = err?.response?.data?.code;
      if (code === 'JUDGE0_AUTH') {
        setOutput('Judge0 authentication failed. Please check JUDGE0_URL and JUDGE0_KEY in backend .env, then restart the server.');
      } else {
        setOutput(`Error: ${msg}`);
      }
    } finally {
      setRunning(false);
    }
  };

  // --- UPDATED SUBMIT HANDLER ---
  const onSubmit = async () => {
    try {
      setSubmitting(true);
      // Map Judge0 language_id to backend language string
      const langObj = LANGUAGE_OPTIONS.find(l => l.id === language);
      const languageStr = langObj ? langObj.value : 'javascript';
      const submissionData = {
        challenge: id,
        code,
        language: languageStr,
        // Optionally: timeSpent, etc.
      };
      const res = await codingSubmissionAPI.submitCode(submissionData);
      setOutput('Submission received. Your code has been sent to the instructor for review.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Submit failed';
      setOutput(`Submit error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!challenge) return <div className="container">Loading challenge...</div>;

  return (
    <div className="container" style={{maxWidth:'1100px', margin:'2rem auto'}}>
      <h1 style={{fontSize:'1.5rem', fontWeight:700}}>{challenge.title}</h1>
      <p style={{whiteSpace:'pre-wrap', margin:'0.75rem 0 1.25rem'}}>{challenge.description}</p>

      <div style={{display:'flex', gap:'1rem', alignItems:'center', marginBottom:'0.75rem'}}>
        <label>Language</label>
        <select value={language} onChange={e=>setLanguage(Number(e.target.value))}>
          {LANGUAGE_OPTIONS.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <button onClick={onRun} disabled={running} className="btn-primary">{running?'Running...':'Run'}</button>
        <button onClick={onSubmit} disabled={submitting} className="btn-primary">{submitting?'Submitting...':'Submit'}</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
        <div>
          <div style={{fontWeight:600, marginBottom:6}}>Editor</div>
          <textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false} style={{width:'100%', height: '360px', fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize:13, padding:12, border:'1px solid #e5e7eb', borderRadius:8}} />
        </div>
        <div>
          <div style={{fontWeight:600, marginBottom:6}}>STDIN (optional)</div>
          <textarea value={stdin} onChange={e=>setStdin(e.target.value)} style={{width:'100%', height: '120px', fontFamily:'inherit', padding:12, border:'1px solid #e5e7eb', borderRadius:8}} />
          <div style={{fontWeight:600, margin:'12px 0 6px'}}>Output</div>
          <pre style={{whiteSpace:'pre-wrap', background:'#0b1020', color:'#e5e7eb', padding:12, borderRadius:8, minHeight:200}}>{output || 'Run code to see output...'}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodingChallenge;