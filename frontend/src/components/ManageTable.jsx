import { useState, useEffect } from 'react';
import { getStats, listRegs, cancelReg } from '../api';

export default function ManageTable({ workshops }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('adminToken') || '');
  const [inputToken, setInputToken] = useState('');
  const [stats, setStats] = useState(null);
  const [regs, setRegs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    sessionStorage.setItem('adminToken', inputToken);
    setToken(inputToken);
  };

  const fetchData = async () => {
    if (!token) return;
    setError('');
    try {
      const statsData = await getStats();
      setStats(statsData);

      const listData = await listRegs({ q: search, workshop_id: selectedWorkshop });
      setRegs(listData.rows || []);
    } catch (err) {
      setError(err.message || 'Unauthorized or failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, search, selectedWorkshop]);

  const handleCancel = async (ref_id) => {
    if (!window.confirm(`Are you sure you want to cancel ${ref_id}?`)) return;
    try {
      await cancelReg(ref_id);
      fetchData();
    } catch (err) {
      alert('Failed to cancel registration: ' + err.message);
    }
  };

  if (!token) {
    return (
      <div className="card animate-rise" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Admin Authentication</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="password"
            placeholder="Enter Admin Token"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
          <button
            type="submit"
            style={{ padding: '0.75rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card">
            <span style={{ color: 'var(--text-muted)' }}>Total Registrations</span>
            <div className="hud-number">{stats.total}</div>
          </div>
          <div className="card">
            <span style={{ color: 'var(--text-muted)' }}>Registered Today</span>
            <div className="hud-number">{stats.today}</div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search name, email, or ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
          <select
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          >
            <option value="">All Workshops</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>{w.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>Ref ID</th>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Email</th>
              <th style={{ padding: '0.75rem' }}>Workshop</th>
              <th style={{ padding: '0.75rem' }}>Date</th>
              <th style={{ padding: '0.75rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {regs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No registrations found.</td>
              </tr>
            ) : (
              regs.map((r) => (
                <tr key={r.ref_id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}><span className="ref-pill" style={{ fontSize: '0.85rem' }}>{r.ref_id}</span></td>
                  <td style={{ padding: '0.75rem' }}>{r.name}</td>
                  <td style={{ padding: '0.75rem' }}>{r.email}</td>
                  <td style={{ padding: '0.75rem' }}>{r.workshop}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => handleCancel(r.ref_id)}
                      style={{ background: 'var(--error)', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}