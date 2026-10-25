import { Request, Response } from 'express';
import { runner } from '../services/runner';
import { RunRequest } from '../shared/types';

const MAX_TOTAL_SIZE = 100 * 1024;

export async function runCode(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as RunRequest;
    
    if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
      res.status(400).json({ error: 'files required' });
      return;
    }
    if (!body.mainFile || !body.mainFile.trim()) {
      res.status(400).json({ error: 'mainFile required' });
      return;
    }

    let totalSize = 0;
    for (const file of body.files) {
      if (!file.name || !file.name.trim()) {
        res.status(400).json({ error: 'invalid file name' });
        return;
      }
      totalSize += (file.content || '').length;
    }
    if (totalSize > MAX_TOTAL_SIZE) {
      res.status(400).json({ error: 'files too large' });
      return;
    }

    const mainFileName = body.mainFile.toLowerCase();
    let lang: 'c' | 'cpp' | 'python';
    if (mainFileName.endsWith('.py')) lang = 'python';
    else if (mainFileName.endsWith('.cpp') || mainFileName.endsWith('.cc') || mainFileName.endsWith('.cxx')) lang = 'cpp';
    else if (mainFileName.endsWith('.c')) lang = 'c';
    else {
      res.status(400).json({ error: 'unsupported language' });
      return;
    }

    console.log(`[${new Date().toISOString()}] [INFO] run request: ${body.files.length} files, main=${body.mainFile}, lang=${lang}`);
    const result = await runner.run(body.files, body.mainFile, lang);
    res.json(result);
  } catch (err: any) {
    console.error(`[${new Date().toISOString()}] [ERROR] controller error: ` + err.message);
    res.status(500).json({ error: 'internal error' });
  }
}
