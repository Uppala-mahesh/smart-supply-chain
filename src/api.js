const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function parseJson(response) {
  const text = await response.text();
  if (!text) {
    if (!response.ok) {
      throw new Error(`Server returned ${response.status} ${response.statusText} with no JSON body`);
    }
    return null;
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (parseError) {
    if (!response.ok) {
      throw new Error(`Server returned ${response.status} ${response.statusText} with invalid JSON: ${text}`);
    }
    throw new Error('Received invalid JSON from server');
  }

  if (!response.ok) {
    throw new Error(data?.message || `Server returned ${response.status} ${response.statusText}`);
  }

  return data;
}

export async function registerCustomer(name, email, password) {
  return parseJson(
    await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
  );
}

export async function loginCustomer(email, password) {
  return parseJson(
    await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
  );
}

export async function fetchProducts(search = '', category = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  const response = await fetch(`${API_BASE}/products?${params.toString()}`);
  return parseJson(response);
}

export async function placeOrder(token, warehouse_id, items) {
  return parseJson(
    await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ warehouse_id, items })
    })
  );
}

export async function fetchOrders(token) {
  return parseJson(
    await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );
}

export async function fetchLogs(token, page = 1, pageSize = 15) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return parseJson(
    await fetch(`${API_BASE}/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );
}
