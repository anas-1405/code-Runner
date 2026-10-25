import { spawn, execFileSync } from 'child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { tmpdir, homedir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { FileInput, RunResult } from '../shared/types';

function findTool(name: string): string {
  const local = 'C:\\mingw64\\bin\\' + name + '.exe';
  if (existsSync(local)) return local;
  try {
    const out = execFileSync('where.exe', [name], { encoding: 'utf8' });
    const first = out.split(/\r?\n/).map(l => l.trim()).filter(Boolean)[0];
    if (first && !first.includes(' ')) return first;
  } catch {}
  const wingetRoot = join(homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages');
  if (existsSync(wingetRoot)) {
    for (const dir of readdirSync(wingetRoot)) {
      if (!dir.toLowerCase().includes('winlibs')) continue;
      const candidate = join(wingetRoot, dir, 'mingw64', 'bin', name + '.exe');
      if (existsSync(candidate)) return candidate;
    }
  }
  return name;
}

const GCC = findTool('gcc');
const GXX = findTool('g++');

export class LocalRunner {
  async run(files: FileInput[], mainFile: string, language: 'c' | 'cpp' | 'python'): Promise<RunResult> {
    const dir = join(tmpdir(), `run-${uuidv4()}`);
    mkdirSync(dir, { recursive: true });
    
    try {
      for (const file of files) {
        writeFileSync(join(dir, file.name), file.content, 'utf8');
      }
      
      if (language === 'python') {
        return await this.runCmd('py', [join(dir, mainFile)], dir);
      } else if (language === 'c') {
        const base = mainFile.replace(/\.c$/, '');
        const exe = join(dir, base + '.exe');
        const sources = files.filter(f => f.name.endsWith('.c')).map(f => join(dir, f.name));
        const args = ['-O2', '-Wall', '-o', exe, ...sources];
        const compile = await this.runCmd(GCC, args, dir, 20000);
        if (compile.exitCode !== 0) {
          return compile;
        }
        return await this.runCmd(exe, [], dir);
      } else if (language === 'cpp') {
        const base = mainFile.replace(/\.cpp$/, '').replace(/\.cc$/, '').replace(/\.cxx$/, '');
        const exe = join(dir, base + '.exe');
        const sources = files.filter(f => /\.(cpp|cc|cxx)$/.test(f.name)).map(f => join(dir, f.name));
        const args = ['-O2', '-Wall', '-o', exe, ...sources];
        const compile = await this.runCmd(GXX, args, dir, 20000);
        if (compile.exitCode !== 0) {
          return compile;
        }
        return await this.runCmd(exe, [], dir);
      }
      
      return { stdout: '', stderr: 'unsupported', exitCode: null, timedOut: false };
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] [ERROR] local run error: ` + err.message);
      return { stdout: '', stderr: err.message, exitCode: null, timedOut: false };
    } finally {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
  }
  
  private runCmd(cmd: string, args: string[], cwd: string, timeoutMs = 10000): Promise<RunResult> {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      const mingwBin = 'C:\\mingw64\\bin';
      const env = { ...process.env } as NodeJS.ProcessEnv;
      if (existsSync(mingwBin)) {
        env.Path = mingwBin + ';' + (env.Path || '');
        env.PATH = env.Path;
      }
      
      const proc = spawn(cmd, args, { cwd, env });
      const timer = setTimeout(() => {
        timedOut = true;
        proc.kill();
      }, timeoutMs);
      
      proc.stdout.on('data', (d) => { stdout += d.toString(); });
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      
      proc.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          stdout: stdout.slice(0, 10000),
          stderr: stderr.slice(0, 10000),
          exitCode: code,
          timedOut
        });
      });
    });
  }
}

export const localRunner = new LocalRunner();
