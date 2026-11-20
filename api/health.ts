import type { IncomingMessage, ServerResponse } from 'node:http';

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
}

export default function handler(
  _req: IncomingMessage,
  res: VercelResponse,
): void {
  res.status(200).json({ ok: true });
}

