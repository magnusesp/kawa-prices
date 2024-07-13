import { apiUrl } from '../config/serverConfig';

export async function fetchData(): Promise<any> {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
}