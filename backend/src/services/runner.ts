import { localRunner } from './localRunner';
import { FileInput, RunResult } from '../shared/types';

export class Runner {
  private useDocker = false;

  async init(): Promise<void> {
    try {
      const Docker = require('dockerode');
      const docker = new Docker();
      await docker.ping();
      this.useDocker = true;
      console.log(`[${new Date().toISOString()}] [INFO] using docker runner`);
    } catch {
      this.useDocker = false;
      console.log(`[${new Date().toISOString()}] [INFO] using local runner`);
    }
  }

  async run(files: FileInput[], mainFile: string, language: 'c' | 'cpp' | 'python'): Promise<RunResult> {
    if (this.useDocker) {
      try {
        const { dockerService } = require('./dockerService');
        return await dockerService.run(files, mainFile, language);
      } catch {
        return await localRunner.run(files, mainFile, language);
      }
    }
    return await localRunner.run(files, mainFile, language);
  }
}

export const runner = new Runner();
