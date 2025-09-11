# @hazbase/storage
[![npm version](https://badge.fury.io/js/@hazbase%2Fstorage.svg)](https://badge.fury.io/js/@hazbase%2Fstorage)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview
`@hazbase/storage` is a lightweight **SDK for the hazBase IPFS storage API** (backed by Pinata).  
It works in **browsers and Node.js** and provides concise functions for **pinning (upload)**, **unpinning (delete)**, and **building public gateway URLs**.  
Under the hood, it integrates with `@hazbase/auth` to **validate your client key**.

- Base endpoint: `{{API_ENDPOINT}}/api/ipfs/*` (configure via `@hazbase/auth`)
- Main functions: `pinFile(files)`, `unpin(cid)`, `gatewayUrl(cid)`
- Internals: Node uses `formdata-node` and `form-data-encoder` for streaming `FormData`

---

## Requirements
- **Node.js**: 18+ (built‑in `fetch` / `ReadableStream` / `duplex: "half"`)
- **TypeScript**: 5+ (recommended)
- **Runtime**: Browser or Node.js

---

## Installation
```bash
npm i @hazbase/storage @hazbase/auth
# or
pnpm add @hazbase/storage @hazbase/auth
```

---

## Pre‑setup (Client key)
`@hazbase/storage` does not read environment variables directly. Configure **@hazbase/auth** once at app start.

```ts
// All comments in English (project convention)
import { setClientKey } from '@hazbase/auth';

setClientKey(process.env.HAZBASE_CLIENT_KEY!);               // required for validation & logging
```

---

## Quick start

### A) Pin files from a browser (`<input type="file">`)
```ts
import { pinFile, gatewayUrl } from '@hazbase/storage';

async function onUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);

  // 1) Pin files to IPFS
  const results = await pinFile(files, { name: 'my-assets', folder: 'v1' });

  // 2) Show gateway URLs
  for (const r of results) {
    console.log('CID:', r.cid, 'URL:', gatewayUrl(r.cid));
  }
}
```

### B) Pin a buffer from Node.js
```ts
import { readFile } from 'node:fs/promises';
import { pinFile } from '@hazbase/storage';

const buf  = await readFile('./image.png');
const res  = await pinFile([buf], { name: 'image.png', contentType: 'image/png' });
console.log(res[0].cid);
```

### C) Unpin a CID (remove from storage)
```ts
import { unpin } from '@hazbase/storage';

await unpin('bafybeigdyrzt...'); // Remove from Pinata (via HAZAMA BASE API)
```

---

## Function reference

### `pinFile(files, opts?) => Promise<PinResult[]>`
- **What it does**: Accepts `File[] | Blob[] | Buffer[]`, posts to `/api/ipfs/pinFiles`, and returns **CIDs**.
- **Params**
  - `files`: `File[] | Blob[] | Buffer[]`
  - `opts?`: `UploadOptions` (`name?: string`, `folder?: string`, `contentType?: string`)
- **Returns**: `PinResult[]` (at minimum includes `{ cid: string }`)

**Example**
```ts
// Pin multiple assets
const pinned = await pinFile([file1, file2], { name: 'batch-2025-09-11', folder: 'assets' });
```

---

### `unpin(cid: CID) => Promise<any>`
- **What it does**: **Unpins** an existing CID.
- **Params**: `cid: string` (CIDv0/v1)
- **Returns**: backend response object (Pinata `unpin` equivalent)

**Example**
```ts
await unpin('bafybeigdyrzt...');
```

---

### `gatewayUrl(cid: CID, gateway?: string) => string`
- **What it does**: Returns a public **gateway URL** by concatenating a base (default: `https://gateway.pinata.cloud/ipfs/`) with the CID.
- **Example**
```ts
const url = gatewayUrl('bafybeigdyrzt...'); 
// -> https://gateway.pinata.cloud/ipfs/bafybeigdyrzt...
```

---

## Types (summary)
```ts
// Basic aliases
export type CID = string;

export interface UploadOptions {
  /** Optional logical name for the batch/file */
  name?: string;
  /** Optional folder tag (Pinata metadata keyvalues.folder) */
  folder?: string;
  /** Content-Type (used for Node Buffer uploads) */
  contentType?: string;
}

export interface PinResult {
  /** Content identifier returned by IPFS/Pinata */
  cid: CID;
  /** Optional fields may be present (e.g., size, isDuplicate, name) */
  [k: string]: any;
}
```

> The response can be extended by your backend. Design for at least a `cid` field.

---

## Error handling
- On HTTP errors, `request()` throws `Error(status, statusText, body)` (e.g., `Pinata POST /pinFiles: 401 Unauthorized ...`).
- `pinFile` / `unpin` propagate exceptions. In UIs, add **retry** and **user‑visible messages**.

---

## Best practices
- **Key hygiene**: call `setClientKey()` at app startup. In browsers, persist as little as possible.
- **CORS**: if you call the API directly from browsers, ensure environment‑appropriate CORS settings.
- **Large files**: uploads >100MB take longer. Provide progress UI and consider chunking/multipart strategies.
- **Public URLs**: if you change the default gateway, consider CDN/LB in front of it.

---

## Troubleshooting
- **`Client key not set`**: call `setClientKey()` first.
- **`Nonce request failed`**: sign‑in/validation may be failing; recheck `@hazbase/auth` setup.
- **`403/401`**: client‑key privileges or expiration; reissue or switch environment.
- **`TypeError: fetch failed`**: network/proxy or server routing to `/api/ipfs` is broken.

---

## License
Apache-2.0
