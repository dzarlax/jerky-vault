export default async function fetcher(endpoint, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL; 
  const url = `${baseUrl}${endpoint}`;
  const token = localStorage.getItem('token');

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

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    const text = await response.text(); // Логирование текста ответа, если JSON парсинг не удался
    console.log('Response Text:', text);
    throw new Error('Failed to parse JSON response');
  }
}
