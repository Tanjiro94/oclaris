import { runGenerationWorker } from '../worker/generationWorker.js';

runGenerationWorker().catch((err) => {
    console.error('[GEN-WORKER] crashed', err);
    process.exit(1);
});
