export default async function fetcher(url: string) {
  const response = await fetch(url, {
    credentials: 'include' // Включаем учетные данные (cookies) для передачи сессионных данных
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  
  const data = await response.json();
  return data;
}
