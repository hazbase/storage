import { request } from './client';
import { CID } from './types';
import { assertValidCid } from './utils';
import { ensureClientKeyActive, createRequestTransaction } from '@hazbase/auth';

/** Unpin (remove) a CID from Pinata. */
export async function unpin(cid: CID): Promise<any> {
  // Validate + encode: this is an authenticated DELETE; an unvalidated cid
  // interpolated into the path could escape the intended endpoint.
  assertValidCid(cid);
  const clientKey = await ensureClientKeyActive(77);
  const res = await request(`/unpin/${encodeURIComponent(cid)}`, 'DELETE', {}, clientKey);

  createRequestTransaction({
    functionId: 77,
    status: 'succeeded',
    isCount: true,
  });

  return res;
}

/** Basic list endpoint (pagination params are optional). 
export async function listPins(page = 0, pageSize = 10) {
  const clientKey = await ensureClientKeyActive(78);
  const q = new URLSearchParams({ page: String(page), pageLimit: String(pageSize) }).toString();
  const res = await request(`/pinList?${q}`, 'GET', {}, clientKey);

  createRequestTransaction({
    functionId: 78,
    status: 'succeeded',
    isCount: true,
  });
  
  return res;
}
*/