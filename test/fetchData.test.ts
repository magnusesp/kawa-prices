import { fetchData } from '../src/fetchData';
import fetch from 'node-fetch';

jest.mock('node-fetch');

describe('fetchData', () => {
  it('should return data when fetch is successful', async () => {
    const mockData = [{ id: 1, name: 'Recipe 1' }];
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    const data = await fetchData();
    expect(data).toEqual(mockData);
  });

  it('should throw an error when fetch fails', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
    });

    await expect(fetchData()).rejects.toThrow('Network response was not ok');
  });
});