import { dockerService } from '../src/services/dockerService';
import { logger } from '../src/core/logger';

async function test() {
  logger.info('test start');
  
  // Test Python
  const pyResult = await dockerService.run(
    [{ name: 'test.py', content: 'print("hello from python")' }],
    'test.py',
    'python'
  );
  if (!pyResult.stdout.includes('hello from python')) {
    throw new Error('python test failed');
  }
  
  // Test C
  const cResult = await dockerService.run(
    [{ name: 'main.c', content: '#include <stdio.h>\nint main(){printf("hello from c");return 0;}' }],
    'main.c',
    'c'
  );
  if (!cResult.stdout.includes('hello from c')) {
    throw new Error('c test failed');
  }
  
  // Test multi-file C
  const multiResult = await dockerService.run(
    [
      { name: 'main.c', content: '#include <stdio.h>\n#include "helper.h"\nint main(){hello();return 0;}' },
      { name: 'helper.h', content: '#ifndef H\n#define H\nvoid hello();\n#endif' },
      { name: 'helper.c', content: '#include <stdio.h>\n#include "helper.h"\nvoid hello(){printf("multi");}' }
    ],
    'main.c',
    'c'
  );
  if (!multiResult.stdout.includes('multi')) {
    throw new Error('multi-file test failed');
  }
  
  logger.info('all tests passed');
}

test().catch(e => {
  logger.error(e.message);
  process.exit(1);
});
