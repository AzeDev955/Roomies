import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('app Express', () => {
  it('responde al healthcheck sin arrancar servidor real', async () => {
    const response = await request(app).get('/ping');

    expect(response.status).toBe(200);
    expect(response.text).toBe('pong');
  });
});
