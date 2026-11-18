import { isRecord } from '../utils/validation';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (isRecord(body) && typeof body.error === 'string' && body.error !== '') return body.error;
  } catch {
  }
  return null;
}

export async function checkResponse(response: Response, fallbackMessage: string) {
  if (response.ok) return;
  const message = await readErrorMessage(response);
  throw new ApiError(response.status, message ?? fallbackMessage);
}
