import { getApiBaseUrl } from '../apiUrl';

describe('getApiBaseUrl', () => {
  it('usa EXPO_PUBLIC_API_URL cuando esta configurada', () => {
    expect(getApiBaseUrl({ EXPO_PUBLIC_API_URL: 'https://roomies.example/api' })).toBe(
      'https://roomies.example/api'
    );
  });

  it('permite localhost solo fuera de produccion', () => {
    expect(getApiBaseUrl({ NODE_ENV: 'test' })).toBe('http://localhost:3000/api');
  });

  it('falla en produccion si falta EXPO_PUBLIC_API_URL', () => {
    expect(() => getApiBaseUrl({ NODE_ENV: 'production' })).toThrow(
      'EXPO_PUBLIC_API_URL es obligatoria'
    );
  });
});
