import { useState } from 'react';
import { lookup } from '../api';

export default function LookupBox() {
  const [ref, setRef] = useState('');
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setTicket(null);
    setLoading(true);

    try {
      const data = await lookup(ref.trim());
      setTicket(data);
    } catch (err) {
      setError(err.message || 'Ticket not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-rise" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Find My Ticket</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Enter Ref ID (e.g. WS-7K2-9QD)"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          required
          style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem 1.25rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Searching...' : 'Lookup'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--error)', fontWeight: 'bold' }}>{error}</p>}

      {ticket && (
        <div style={{ padding: '1rem', border: '1px dashed var(--accent)', borderRadius: '8px', background: 'rgba(94,234,212,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span className="ref-pill">{ticket.ref_id}</span>
          </div>
          <p><strong>Name:</strong> {ticket.name}</p>
          <p><strong>Workshop:</strong> {ticket.workshop}</p>
          <p><strong>Email:</strong> {ticket.email}</p>
          <p><strong>Registered On:</strong> {new Date(ticket.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}