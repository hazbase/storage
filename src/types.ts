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
}
