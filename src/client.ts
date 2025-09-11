import { getApiEndpoint } from '@hazbase/auth';
import { FormData } from 'formdata-node';
import { FormDataEncoder } from 'form-data-encoder';

export async function request<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: any,
  clientKey?: string
): Promise<T> {
  const apiEndpoint = getApiEndpoint();
  const API_BASE = apiEndpoint + '/api/ipfs';
  /* ------------------------------------------------------------------ */
  /*  Build headers + body                                               */
  /* ------------------------------------------------------------------ */
  const authHeaders = {
    'x-client-key': clientKey?? ''
  };
  let headers: Record<string, string> = { ...authHeaders };
  let realBody: any = body;
  let duplex: 'half' | undefined;

  if (body instanceof FormData) {
    const encoder   = new FormDataEncoder(body);
    headers         = { ...headers, ...encoder.headers };
    realBody        = encoder.encode();
    duplex          = 'half';
  }
  const res = await fetch(API_BASE + endpoint, {
    method,
    headers,
    body: realBody,
    duplex
  } as RequestInit);

  if (res.ok) {
    return (await res.json()) as T;
  }
  const txt = await res.text().catch(() => '');
  const err = new Error(
    `Pinata ${method} ${endpoint}: ${res.status} ${res.statusText} ${txt}`
  ) as any;
  err.status = res.status;
  throw err;
}