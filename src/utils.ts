import { CID, UploadOptions } from './types';
import { FormData, File as NodeFile } from 'formdata-node';

/**
 * IPFS CIDs are base58 (CIDv0) or multibase (CIDv1) strings — strictly
 * alphanumeric, no path/query characters. Reject anything else so a caller that
 * forwards untrusted input cannot inject '../', '?', '#' etc. into request paths.
 */
// The alphanumeric charset is what blocks path/query injection; the length bound
// is only a sanity cap, set generously so unusual-but-valid CIDs are not rejected.
const CID_RE = /^[A-Za-z0-9]{10,256}$/;

export function assertValidCid(cid: CID): void {
  if (typeof cid !== 'string' || !CID_RE.test(cid)) {
    throw new Error(`Invalid CID: ${String(cid)}`);
  }
}

export function gatewayUrl(cid: CID, gateway = 'https://gateway.pinata.cloud/ipfs/'): string {
  assertValidCid(cid);
  return `${gateway}${encodeURIComponent(cid)}`;
}

/** Size of a single input in bytes (Buffer/Blob/File). */
function inputSize(input: File | Blob | Buffer): number {
  return input instanceof Buffer ? input.length : (input as Blob).size ?? 0;
}

/** Creates a FormData with the file/blob/buffer attached */
export function buildFormData(
  inputs: File[] | Blob[] | Buffer[],
  field = 'file',
  opts: UploadOptions = {}
): FormData {
  // Optional, opt-in client-side caps (defense-in-depth; the API/Pinata enforce
  // the authoritative quotas). No limit is applied unless the caller sets one.
  if (opts.maxFileCount != null && inputs.length > opts.maxFileCount) {
    throw new Error(`upload exceeds maxFileCount (${inputs.length} > ${opts.maxFileCount})`);
  }
  if (opts.maxFileSize != null) {
    for (const input of inputs) {
      const size = inputSize(input as File | Blob | Buffer);
      if (size > opts.maxFileSize) {
        throw new Error(`upload file exceeds maxFileSize (${size} > ${opts.maxFileSize})`);
      }
    }
  }
  const fd = new FormData();
  inputs.map((input) => {
    const file =
      input instanceof Buffer
        ? new NodeFile([input], opts.name ?? 'file', { type: opts.contentType })
        : input;
    fd.append(field, file as any);
  });
  if (opts.name) {
    fd.append(
      'pinataMetadata',
      JSON.stringify({ name: opts.name, keyvalues: { folder: opts.folder } })
    );
  }
  return fd;
}
