export type Language = 'c' | 'cpp' | 'python';

export interface FileInput {
  name: string;
  content: string;
}

export interface RunRequest {
  files: FileInput[];
  mainFile: string;
  language?: Language;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
}
