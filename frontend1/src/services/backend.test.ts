import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

type Call = { url: string; method: string; headers: Record<string, string>; body?: string };
let calls: Call[] = [];
let responder: (call: Call) => { status: number; body?: unknown };

beforeEach(() => {
  calls = [];
  (globalThis as any).document = { cookie: 'XSRF-TOKEN=abc123' };
  (globalThis as any).fetch = async (url: string, init: any = {}) => {
    const call: Call = { url, method: init.method ?? 'GET', headers: init.headers ?? {}, body: init.body };
    calls.push(call);
    const r = responder(call);
    return { ok: r.status < 400, status: r.status, json: async () => { if (r.body === undefined) throw new Error('no body'); return r.body; } };
  };
});

const { backend, ApiError } = await import('./backend.ts');

test('GET requests do not need the CSRF header', async () => {
  responder = () => ({ status: 200, body: [] });
  await backend.tasks.list();
  assert.equal(calls[0].method, 'GET');
  assert.equal(calls[0].headers['X-XSRF-TOKEN'], undefined);
});

test('POST/PUT/DELETE echo the XSRF cookie in X-XSRF-TOKEN', async () => {
  responder = () => ({ status: 200, body: { id: 1 } });
  await backend.tasks.complete(5);
  assert.equal(calls[0].method, 'PUT');
  assert.equal(calls[0].headers['X-XSRF-TOKEN'], 'abc123');
  assert.equal(calls[0].url, '/api/tasks/5/complete');
});

test('JSON bodies get a content type and are serialised', async () => {
  responder = () => ({ status: 201, body: { id: 9 } });
  await backend.login('a@b.com', 'secret-pass');
  assert.equal(calls[0].headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0].body!), { email: 'a@b.com', password: 'secret-pass' });
});

test('the CSRF cookie is fetched first when it is missing', async () => {
  (globalThis as any).document.cookie = '';
  responder = () => ({ status: 204 });
  await backend.logout();
  assert.equal(calls[0].url, '/api/auth/csrf');
  assert.equal(calls[1].url, '/api/auth/logout');
});

test('204 responses resolve to undefined', async () => {
  responder = () => ({ status: 204 });
  assert.equal(await backend.tasks.remove(1), undefined);
});

test('API problem details become readable errors with field messages', async () => {
  responder = () => ({ status: 400, body: { detail: 'Validation failed', errors: { password: 'Password must be 8 to 72 characters' } } });
  await assert.rejects(backend.register('a@b.com', 'short', 'Asia/Kolkata'), (e: any) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.status, 400);
    assert.match(e.message, /Validation failed: Password must be 8 to 72 characters/);
    return true;
  });
});

test('401 and 403 without a body get helpful messages', async () => {
  responder = () => ({ status: 401 });
  await assert.rejects(backend.me(), (e: any) => e.status === 401 && /log in/i.test(e.message));
  responder = () => ({ status: 403 });
  await assert.rejects(backend.tasks.complete(1), (e: any) => e.status === 403 && /Security token/.test(e.message));
});

test('a network failure explains that the backend may be down', async () => {
  (globalThis as any).fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(backend.me(), (e: any) => e.status === 0 && /backend running/.test(e.message));
});
