// Global auth handler for automatic logout on auth errors
let authErrorHandler: (() => void) | null = null;

export const setAuthErrorHandler = (handler: () => void) => {
  authErrorHandler = handler;
};

// Enhanced error class with structured error support
class FetchError extends Error {
  status: number;
  field?: string;
  value?: string;
  existing_id?: number;
  
  constructor(message: string, status: number, errorData?: any) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    
    // Include structured error data if available
    if (errorData) {
      this.field = errorData.field;
      this.value = errorData.value;
      this.existing_id = errorData.existing_id;
    }
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
      let errorData = null;
      let errorMessage = `Failed to fetch: ${response.status} ${response.statusText}`;
      
      try {
        // Try to parse JSON error response
        const errorText = await response.text();
        if (errorText) {
          try {
            errorData = JSON.parse(errorText);
            // Use server error message if available
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            // If JSON parsing fails, use the text as is
            errorMessage = errorText;
          }
        }
      } catch (textError) {
        console.warn('Failed to read error response text:', textError);
      }
      
      console.error('Fetch Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
      });
      
      throw new FetchError(errorMessage, response.status, errorData);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    // If it's already a FetchError, rethrow as is
    if (error instanceof FetchError) {
      throw error;
    }
    
    console.error('Fetch request failed:', error);
    throw error;
  }
}
