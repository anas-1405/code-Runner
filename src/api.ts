import { FileInput, RunResult } from './types';

export async function runCode(files: FileInput[], mainFile: string): Promise<RunResult> {
  try {
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files, mainFile })
    });
    
    if (!res.ok) {
      let msg = 'request failed';
      try {
        const err = await res.json();
        msg = err.error || msg;
      } catch {
        msg = `request failed (${res.status})`;
      }
      throw new Error(msg);
    }
    
    return res.json();
  } catch (e: any) {
    if (e.message) throw e;
    throw new Error('network error');
  }
}
