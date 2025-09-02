// Funciones de debug temporal para verificar el manejo del JWT

export function debugToken() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token in localStorage:', token ? 'EXISTS' : 'NOT FOUND');
    console.log('🔑 Token preview:', token ? token.substring(0, 50) + '...' : 'N/A');
  }
}

export function debugApiHeaders() {
  const token = localStorage.getItem('accessToken');
  console.log('📡 Authorization header would be:', token ? `Bearer ${token}` : 'NO TOKEN');
}

export function clearDebugToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    console.log('🗑️ Token cleared from localStorage');
  }
}