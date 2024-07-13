import { fetchData } from './fetchData';

async function main() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

main();