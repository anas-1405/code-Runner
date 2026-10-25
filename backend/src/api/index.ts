import { Router } from 'express';
import { runCode } from './run';

const router = Router();

router.post('/run', runCode);

export default router;
