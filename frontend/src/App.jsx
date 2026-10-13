import { useState, useEffect } from 'react';

function App() {
  const [workshops, setWorkshops] = useState([]);
  const [formData, setFormData] = useState({ workshop_id: '', name: '', email: '' });
  const [message, setMessage] = useState('');

  // Pulls the build number injected by Jenkins, defaults to 'local' for now
  const buildNumber = import.meta.env.VITE_BUILD_NUMBER || 'local';

  useEffect(() => {
    // We use relative paths because the Nginx proxy routes /api to the backends
    fetch('/api/workshops/')
      .then(res => res.json())
      .then(data => setWorkshops(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/api/registrations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      
      if (response.ok) {
        setMessage('Success: ' + result.message);
        setFormData({ workshop_id: '', name: '', email: '' }); // Reset form
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>Workshop Registration</h1>
      
      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Available Workshops</h2>
        <ul style={{ paddingLeft: '20px' }}>
          {workshops.map(w => (
            <li key={w.id} style={{ marginBottom: '10px' }}>
              <strong>{w.title}</strong> - {w.description} <br/>
              <small>Capacity: {w.capacity} seats</small>
            </li>
          ))}
        </ul>
      </div>

      <h2>Register Here</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <select 
          required
          value={formData.workshop_id} 
          onChange={(e) => setFormData({...formData, workshop_id: e.target.value})}
          style={{ padding: '8px' }}
        >
          <option value="">-- Select a Workshop --</option>
          {workshops.map(w => (
            <option key={w.id} value={w.id}>{w.title}</option>
          ))}
        </select>
        
        <input 
          type="text" 
          placeholder="Your Name" 
          required 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          style={{ padding: '8px' }}
        />
        
        <input 
          type="email" 
          placeholder="Your Email" 
          required 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={{ padding: '8px' }}
        />
        
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Submit Registration
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '20px', padding: '10px', backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9', borderRadius: '4px' }}>
          {message}
        </p>
      )}

      <footer style={{ marginTop: '50px', borderTop: '1px solid #ccc', paddingTop: '10px', fontSize: '0.8em', color: '#666' }}>
        <p>Build Number: {buildNumber}</p>
      </footer>
    </div>
  );
}

export default App;