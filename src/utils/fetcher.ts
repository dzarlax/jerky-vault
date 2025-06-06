// Global auth handler for automatic logout on auth errors
let authErrorHandler: (() => void) | null = null;

export const setAuthErrorHandler = (handler: () => void) => {
  authErrorHandler = handler;
};

// Custom error class with status property
class FetchError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
  }
}

export default async function fetcher(endpoint, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL; 
  if (!baseUrl) {
    throw new Error('Базовый URL API не установлен. Проверьте переменные окружения.');
  }

  const url = `${baseUrl}${endpoint}`;
  
  // Get token if we're on the client side
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      ...options,
    });

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication failed, token may be expired or invalid');
      
      // Clear localStorage and call auth error handler if available
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Call the global auth error handler to logout user
      if (authErrorHandler) {
        authErrorHandler();
      }
      
      throw new FetchError('Authentication failed', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      throw new FetchError(`Failed to fetch: ${response.status} ${response.statusText}`, response.status);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Fetch request failed:', error);
    throw error;
  }
}
