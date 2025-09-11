let _headers: Record<string, string> = {};

/** Internal helper: returns auth headers or throws if unset. */
export function getAuthHeaders(): Record<string, string> {
  if (!Object.keys(_headers).length) {
    throw new Error('Pinata auth not set. Call setPinataAuth() first.');
  }
  return _headers;
}
