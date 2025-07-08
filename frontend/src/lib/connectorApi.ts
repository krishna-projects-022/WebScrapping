const API_BASE_URL = "https://webscrapping-uol6.onrender.com/api/connectors";

export const getConnectors = async () => {
  const res = await fetch(API_BASE_URL, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error('Failed to fetch connectors');
  return res.json();
};

export const getConnector = async (id) => {
  const res = await fetch(`${API_BASE_URL}/${id}`, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error('Failed to fetch connector');
  return res.json();
};

export const createConnector = async (data) => {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create connector');
  return res.json();
};

export const updateConnector = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update connector');
  return res.json();
};

export const deleteConnector = async (id) => {
  const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete connector');
  return res.json();
};

export const testConnector = async (id) => {
  const res = await fetch(`${API_BASE_URL}/${id}/test`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to test connector');
  return res.json();
};
