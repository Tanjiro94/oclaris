import prisma from '../infra/db/prismaClient.js';
import { callImageModel } from '../infra/ai/imageProvider.js';

const POLL_INTERVAL_MS = 5000;

type GenerationJobParams = {
prompt?: string;
use_gear?: boolean;
gear?: { type: string; brand: string; model: string }[];
images_count?: number;
} | null;

function getImagesCountFromParams(params: GenerationJobParams): number {
if (params && typeof params.images_count === 'number' && params.images_count > 0) {
    return params.images_count;
}
return 4;
}

async function sleep(ms: number): Promise<void> {
return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runGenerationWorker(): Promise<never> {
console.log('[GEN-WORKER] start');

while (true) {
    try {
    const job = await prisma.generation_job.findFirst({
        where: { status: 'queued' },
        orderBy: { started_at: 'asc' },
    });

    if (!job) {
        await sleep(POLL_INTERVAL_MS);
        continue;
    }

    const startedAt = new Date();

    await prisma.generation_job.update({
        where: { id: job.id },
        data: { status: 'running', started_at: startedAt },
    });

    try {
        const params = job.params as GenerationJobParams;
        const imagesCount = getImagesCountFromParams(params);
        const prompt = params?.prompt ?? '';

        const result = await callImageModel({
        model: job.model,
        artDirectionId: job.art_direction_id,
        userId: job.user_id,
        imagesCount,
        prompt,
        });

        if (result.urls.length > 0) {
        await prisma.picture_generated.createMany({
            data: result.urls.map((url) => ({
            art_direction_id: job.art_direction_id,
            url,
            format: 'jpg',
            })),
        });
        }

        const finishedAt = new Date();
        await prisma.generation_job.update({
        where: { id: job.id },
        data: {
            status: 'succeeded',
            finished_at: finishedAt,
            duration: Math.round(
            (finishedAt.getTime() - startedAt.getTime()) / 1000,
            ),
            message: result.message ?? null,
        },
        });
    } catch (err: unknown) {
        const finishedAt = new Date();
        const message =
        err instanceof Error ? err.message : 'Erreur inconnue';

        await prisma.generation_job.update({
        where: { id: job.id },
        data: {
            status: 'failed',
            finished_at: finishedAt,
            message,
        },
        });
    }
    } catch (e) {
    console.error('[GEN-WORKER] fatal error', e);
    await sleep(POLL_INTERVAL_MS);
    }
}
}
