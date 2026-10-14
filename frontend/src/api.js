const j = async r => {
  const body = r.status === 204 ? null : await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body?.error || `HTTP ${r.status}`);
  return body;
};

const adminHdr = () => ({ 'x-admin-token': sessionStorage.getItem('adminToken') || '' });

export const getWorkshops = () => fetch('/api/workshops').then(j);

export const register = data => fetch('/api/registrations/', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify(data) 
}).then(j);

export const lookup = ref => fetch(`/api/registrations/${encodeURIComponent(ref)}`).then(j);
export const listRegs = qs => fetch(`/api/registrations/?${new URLSearchParams(qs)}`, { headers: adminHdr() }).then(j);
export const getStats = () => fetch('/api/registrations/stats', { headers: adminHdr() }).then(j);
export const cancelReg = ref => fetch(`/api/registrations/${encodeURIComponent(ref)}`, { method: 'DELETE', headers: adminHdr() }).then(j);