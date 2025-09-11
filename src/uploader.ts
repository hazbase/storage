import { request } from './client';
import { buildFormData } from './utils';
import { PinResponse, PinResult, UploadOptions } from './types';
import { ensureClientKeyActive, createRequestTransaction } from '@hazbase/auth';

/** File / Blob / Buffer -> CID */
export async function pinFile(files: File[] | Blob[] | Buffer[], opts: UploadOptions = {}): Promise<PinResult[]> {
  const clientKey = await ensureClientKeyActive(76);

  const form = buildFormData(files, 'file', opts);
  const res = await request<PinResponse>('/pinFiles', 'POST', form, clientKey);
  
  createRequestTransaction({
    functionId: 76,
    status: 'succeeded',
    isCount: true,
  });

  return res?.result;
}
