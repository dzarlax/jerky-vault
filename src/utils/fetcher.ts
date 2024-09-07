export default async function fetcher(endpoint, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL; 
  if (!baseUrl) {
    throw new Error('Базовый URL API не установлен. Проверьте переменные окружения.');
  }

  // Проверяем, что код выполняется на клиентской стороне
  if (typeof window === 'undefined') {
    throw new Error('Fetcher должен выполняться только на клиенте');
  }

  const url = `${baseUrl}${endpoint}`;
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Fetch request failed:', error);
    throw error;
  }
}
