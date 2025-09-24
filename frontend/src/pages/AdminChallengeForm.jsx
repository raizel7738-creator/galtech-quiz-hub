import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { codingChallengeAPI, categoriesAPI } from '../services/api';

const DEFAULT_LANGUAGES = [63, 71, 62, 54];

const AdminChallengeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    problemStatement: '',
    difficulty: 'beginner',
    points: 10,
    timeLimit: 0,
    sampleInput: '',
    sampleOutput: '',
    starterCode: '',
    languages: DEFAULT_LANGUAGES,
    category: '',
    status: 'draft',
    testCases: [{ input: '', output: '', hidden: true, weight: 1 }]
  });

  useEffect(() => {
    (async () => {
      const cats = await categoriesAPI.getCategories();
      const list = cats.data?.categories || cats.data || [];
      setCategories(list);
      if (!form.category && list[0]?._id) setForm(f => ({ ...f, category: list[0]._id }));

      if (id) {
        const res = await codingChallengeAPI.getCodingChallenge(id);
        const data = res.data?.challenge || res.data || res;
        setForm({
          title: data.title || '',
          description: data.description || '',
          problemStatement: data.problemStatement || '',
          difficulty: data.difficulty || 'beginner',
          points: data.points || 10,
          timeLimit: data.timeLimit || 0,
          sampleInput: data.sampleInput || '',
          sampleOutput: data.sampleOutput || '',
          starterCode: data.starterCode || '',
          languages: data.languages?.length ? data.languages : DEFAULT_LANGUAGES,
          category: data.category?._id || data.category || '',
          status: data.status || 'draft',
          testCases: data.testCases?.length ? data.testCases : [{ input: '', output: '', hidden: true, weight: 1 }],
        });
      }
    })();
  }, [id]);

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateTest = (index, key, value) => {
    setForm(prev => {
      const copy = [...prev.testCases];
      copy[index] = { ...copy[index], [key]: value };
      return { ...prev, testCases: copy };
    });
  };
  const addTest = () => setForm(prev => ({ ...prev, testCases: [...prev.testCases, { input: '', output: '', hidden: true, weight: 1 }] }));
  const removeTest = (index) => setForm(prev => ({ ...prev, testCases: prev.testCases.filter((_, i) => i !== index) }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      if (id) {
        await codingChallengeAPI.updateCodingChallenge(id, form);
      } else {
        await codingChallengeAPI.createCodingChallenge(form);
      }
      navigate('/admin/coding-challenges');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Save failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 960, margin: '2rem auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{id ? 'Edit' : 'Create'} Coding Challenge</h1>
      {error && <div style={{ marginTop: 12, color: '#b91c1c' }}>Error: {error}</div>}
      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <input value={form.title} onChange={e=>updateField('title', e.target.value)} placeholder="Title" required />
        <textarea value={form.description} onChange={e=>updateField('description', e.target.value)} placeholder="Short description" rows={3} />
        <textarea value={form.problemStatement} onChange={e=>updateField('problemStatement', e.target.value)} placeholder="Problem statement" rows={6} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <select value={form.difficulty} onChange={e=>updateField('difficulty', e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input type="number" value={form.points} onChange={e=>updateField('points', Number(e.target.value))} placeholder="Points" />
          <select value={form.category} onChange={e=>updateField('category', e.target.value)}>
            {categories.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <textarea value={form.sampleInput} onChange={e=>updateField('sampleInput', e.target.value)} placeholder="Sample input" rows={3} />
          <textarea value={form.sampleOutput} onChange={e=>updateField('sampleOutput', e.target.value)} placeholder="Sample output" rows={3} />
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Starter Code</div>
          <textarea value={form.starterCode} onChange={e=>updateField('starterCode', e.target.value)} rows={8} style={{ width:'100%', fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Hidden Test Cases</div>
          {form.testCases.map((tc, idx) => (
            <div key={idx} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:8, marginBottom:8 }}>
              <input value={tc.input} onChange={e=>updateTest(idx, 'input', e.target.value)} placeholder="Input (optional)" />
              <input value={tc.output} onChange={e=>updateTest(idx, 'output', e.target.value)} placeholder="Expected output" required />
              <input type="number" min={1} value={tc.weight} onChange={e=>updateTest(idx, 'weight', Number(e.target.value))} title="Weight" style={{ width:80 }} />
              <button type="button" onClick={()=>removeTest(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addTest}>Add test</button>
        </div>
        <div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Challenge'}</button>
          <button type="button" className="btn-secondary" onClick={()=>navigate('/admin/coding-challenges')} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AdminChallengeForm;


