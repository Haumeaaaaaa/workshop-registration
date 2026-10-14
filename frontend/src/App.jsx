import { useState, useEffect } from 'react';
import { getWorkshops, register } from './api';
import { useTheme } from './hooks/useTheme';
import './styles/theme.css';

import LookupBox from './components/LookupBox';
import ManageTable from './components/ManageTable';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('register');
  const [workshops, setWorkshops] = useState([]);
  const [formData, setFormData] = useState({ workshop_id: '', name: '', email: '' });
  const [resMsg, setResMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const buildNumber = import.meta.env.VITE_BUILD_NUMBER || 'local';

  const loadWorkshops = async () => {
    try {
      const data = await getWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error('Error fetching workshops:', err);
    }
  };

  useEffect(() => {
    loadWorkshops();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResMsg(null);
    setLoading(true);

    try {
      const res = await register(formData);
      setResMsg({ success: true, message: res.message, ref_id: res.ref_id });
      setFormData({ workshop_id: '', name: '', email: '' });
      loadWorkshops();
    } catch (err) {
      setResMsg({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Topbar */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel)' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', background: 'linear-gradient(to right, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Workshop Portal
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setTab('register')} style={{ background: 'none', border: 'none', color: tab === 'register' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer' }}>Register</button>
          <button onClick={() => setTab('lookup')} style={{ background: 'none', border: 'none', color: tab === 'lookup' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer' }}>Find Ticket</button>
          <button onClick={() => setTab('manage')} style={{ background: 'none', border: 'none', color: tab === 'manage' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer' }}>Manage</button>
          <button onClick={toggleTheme} style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {tab === 'register' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Workshop Status Cards */}
            <div>
              <h2>Available Workshops</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workshops.map((w) => {
                  const taken = w.taken || 0;
                  const pct = Math.min(Math.round((taken / w.capacity) * 100), 100);
                  return (
                    <div key={w.id} className="card animate-rise">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>{w.title}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{taken} / {w.capacity} seats</span>
                      </div>
                      <div className="progress-bg">
                        <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Registration Form */}
            <div className="card animate-rise">
              <h2>Reserve a Seat</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select
                  required
                  value={formData.workshop_id}
                  onChange={(e) => setFormData({ ...formData, workshop_id: e.target.value })}
                  style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value="">-- Select a Workshop --</option>
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id} disabled={(w.taken || 0) >= w.capacity}>
                      {w.title} {(w.taken || 0) >= w.capacity ? '(FULL)' : ''}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />

                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '0.75rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {loading ? 'Processing...' : 'Submit Registration'}
                </button>
              </form>

              {resMsg && (
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '6px', background: resMsg.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${resMsg.success ? 'var(--success)' : 'var(--error)'}` }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: resMsg.success ? 'var(--success)' : 'var(--error)' }}>
                    {resMsg.message}
                  </p>
                  {resMsg.ref_id && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                      <span className="ref-pill">{resMsg.ref_id}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'lookup' && <LookupBox />}

        {tab === 'manage' && <ManageTable workshops={workshops} />}
      </main>

      {/* Footer with CI/CD Injected Build Number */}
      <footer style={{ padding: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Build Number: {buildNumber}
      </footer>
    </div>
  );
}