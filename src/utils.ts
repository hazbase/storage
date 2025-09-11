import { CID, UploadOptions } from './types';
import { FormData, File as NodeFile } from 'formdata-node';

export function gatewayUrl(cid: CID, gateway = 'https://gateway.pinata.cloud/ipfs/'): string {
  return `${gateway}${cid}`;
}

/** Creates a FormData with the file/blob/buffer attached */
export function buildFormData(
  inputs: File[] | Blob[] | Buffer[],
  field = 'file',
  opts: UploadOptions = {}
): FormData {
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
