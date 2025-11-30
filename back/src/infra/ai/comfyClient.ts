const COMFY_BASE_URL =
    process.env.COMFY_BASE_URL ?? 'http://127.0.0.1:8188';

const COMFY_CHECKPOINT_NAME =
    process.env.COMFY_CHECKPOINT_NAME ?? 'sd_xl_base_1.0.safetensors';

export interface ComfyGenerateParams {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    batchSize?: number;
    seed?: number;
}

export interface GeneratedImage {
    url: string;
}

interface ComfyPromptResponse {
    prompt_id: string;
    node_errors?: unknown;
}

interface ComfyHistoryImage {
    filename: string;
    subfolder: string;
    type: string;
}

interface ComfyNodeOutput {
    images?: ComfyHistoryImage[];
    [key: string]: unknown;
}

interface ComfyHistoryEntry {
    outputs?: Record<string, ComfyNodeOutput>;
    [key: string]: unknown;
}

type ComfyHistoryResponse = Record<string, ComfyHistoryEntry>;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateImagesWithComfy(
    params: ComfyGenerateParams,
): Promise<GeneratedImage[]> {
    const {
        prompt,
        negativePrompt = '',
        width = 768,
        height = 1152,
        steps = 15,
        cfg = 6,
        batchSize = 2,
        seed,
    } = params;

    const finalSeed =
        typeof seed === 'number'
            ? seed
            : Math.floor(Math.random() * 2_147_483_647);

    const workflow = {
        '3': {
            inputs: {
                ckpt_name: COMFY_CHECKPOINT_NAME,
            },
            class_type: 'CheckpointLoaderSimple',
            _meta: {
                title: 'Charger Point de Contrôle',
            },
        },
        '4': {
            inputs: {
                clip: ['3', 1],
                text: prompt,
            },
            class_type: 'CLIPTextEncode',
            _meta: {
                title: 'CLIP Text Encode (Prompt)',
            },
        },
        '5': {
            inputs: {
                clip: ['3', 1],
                text: negativePrompt,
            },
            class_type: 'CLIPTextEncode',
            _meta: {
                title: 'CLIP Text Encode (Negative)',
            },
        },
        '6': {
            inputs: {
                width,
                height,
                batch_size: batchSize,
            },
            class_type: 'EmptyLatentImage',
            _meta: {
                title: 'Image Latente Vide',
            },
        },
        '7': {
            inputs: {
                seed: finalSeed,
                steps,
                cfg,
                sampler_name: 'euler',
                scheduler: 'simple',
                denoise: 1.0,
                model: ['3', 0],
                positive: ['4', 0],
                negative: ['5', 0],
                latent_image: ['6', 0],
            },
            class_type: 'KSampler',
            _meta: {
                title: 'KSampler',
            },
        },
        '8': {
            inputs: {
                samples: ['7', 0],
                vae: ['3', 2],
            },
            class_type: 'VAEDecode',
            _meta: {
                title: 'VAE Decode',
            },
        },
        '9': {
            inputs: {
                images: ['8', 0],
                filename_prefix: 'oclaris_da',
            },
            class_type: 'SaveImage',
            _meta: {
                title: 'Enregistrer Image',
            },
        },
    };

    const promptRes = await fetch(`${COMFY_BASE_URL}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: workflow }),
    });

    if (!promptRes.ok) {
        const txt = await promptRes.text().catch(() => '');
        throw new Error(
            `Erreur ComfyUI /prompt ${promptRes.status}: ${
                txt || promptRes.statusText
            }`,
        );
    }

    const promptJson = (await promptRes.json()) as ComfyPromptResponse;

    if (!promptJson.prompt_id) {
        throw new Error('ComfyUI : aucun prompt_id retourné');
    }

    const promptId = promptJson.prompt_id;

    const delayMs = 1000;
    const maxTries = 180;

    for (let i = 0; i < maxTries; i++) {
        const historyRes = await fetch(
            `${COMFY_BASE_URL}/history/${promptId}`,
        );

        if (!historyRes.ok) {
            await sleep(delayMs);
            continue;
        }

        const historyJson = (await historyRes.json()) as ComfyHistoryResponse;

        const entry = historyJson[promptId];
        if (!entry || !entry.outputs) {
            await sleep(delayMs);
            continue;
        }

        const allOutputs = Object.values(entry.outputs);
        const nodeWithImages = allOutputs.find(
            (out) => Array.isArray(out.images) && out.images.length > 0,
        );

        if (!nodeWithImages || !Array.isArray(nodeWithImages.images)) {
            await sleep(delayMs);
            continue;
        }

        const images: GeneratedImage[] = nodeWithImages.images.map(
            (img: ComfyHistoryImage): GeneratedImage => {
                const filename = img.filename;
                const subfolder = img.subfolder ?? 'output';
                const type = img.type ?? 'output';

                const url =
                    `${COMFY_BASE_URL}/view?` +
                    `filename=${encodeURIComponent(filename)}` +
                    `&subfolder=${encodeURIComponent(subfolder)}` +
                    `&type=${encodeURIComponent(type)}`;

                return { url };
            },
        );

        if (images.length === 0) {
            throw new Error(
                'ComfyUI : aucune image générée dans les outputs',
            );
        }

        return images;
    }

    throw new Error(
        'ComfyUI : délai dépassé, aucune image récupérée dans /history',
    );
}
