export interface Capture {
  id: number;
  url: string;
  method: string;
  status: number;
  statusText: string;
  decoded: unknown;
  error?: string;
  size: number;
  time: number;
  duration: number;
}
