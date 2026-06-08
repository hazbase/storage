export type CID = string;

export interface PinResult {
  hash: CID;
  url: string;
  uploadedAt: string;
  filesize: number;
}

export interface PinResponse {
  result: PinResult[];
}

export interface UploadOptions {
  name?: string;
  folder?: string;
  contentType?: string;
  /** Optional cap on number of files per upload (defense-in-depth; off by default). */
  maxFileCount?: number;
  /** Optional cap on per-file size in bytes (defense-in-depth; off by default). */
  maxFileSize?: number;
}
