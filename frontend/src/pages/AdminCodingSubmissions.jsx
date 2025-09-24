import React, { useEffect, useState } from 'react';
import { codingChallengeAPI, codingSubmissionAPI } from '../services/api';

const AdminCodingSubmissions = () => {
  const [challengeId, setChallengeId] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await codingChallengeAPI.getCodingChallenges();
        const list = res.data?.challenges || res.data || [];
        setChallenges(list);
        if (list[0]?._id) setChallengeId(list[0]._id);
      } catch (e) {
        setError('Failed to load challenges');
      }
    })();
  }, []);

  useEffect(() => {
    if (!challengeId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await codingSubmissionAPI.getAllSubmissions({ challenge: challengeId });
        const data = res.data?.submissions || res.data || [];
        setSubs(data);
      } catch (e) {
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    })();
  }, [challengeId]);

  return (
    <div className="container" style={{ maxWidth: 1100, margin: '1.5rem auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Coding Challenge Submissions</h1>
      {error && <div style={{ color: '#b91c1c', marginTop: 8 }}>{error}</div>}
      <div style={{ margin: '12px 0' }}>
        <label style={{ marginRight: 8 }}>Challenge:</label>
        <select value={challengeId} onChange={e => setChallengeId(e.target.value)}>
          {challenges.map(c => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : subs.length === 0 ? (
        <div>No submissions yet.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Language</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Submitted</th>
                <th className="px-4 py-2 text-left">Code</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s._id} className="border-t">
                  <td className="px-4 py-2">{s.student?.name || s.student?.email || 'Student'}</td>
                  <td className="px-4 py-2">{s.language || 'N/A'}</td>
                  <td className="px-4 py-2">{s.status || 'N/A'}</td>
                  <td className="px-4 py-2">{s.submissionTime ? new Date(s.submissionTime).toLocaleString() : (s.createdAt ? new Date(s.createdAt).toLocaleString() : 'N/A')}</td>
                  <td className="px-4 py-2" style={{ maxWidth: 420 }}>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{s.code?.slice(0, 1000) || ''}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCodingSubmissions;