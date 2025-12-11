// da.service.ts

import prisma from '../../../infra/db/prismaClient.js';

import type {
    CreateDaInput,
    UpdateDaInput,
    GetDaListQuery,
    GetDaListResponse,
    DaListItem,
    DaPlaceBodyInput,
    SetDaStylesInput,
    SetDaConstraintsInput,
    ListGenerationJobsForDaParams,
    ListGenerationJobsQuery,
    ListGenerationJobsResponse,
    GenerationJobListItem,
    GenerateDaBodyInput,
    GenerateDaResponse,
    EnqueueGenerationJobInput,
    CreateImageGenerationJobInput,
} from '../validator/da.js';

import { refinePromptWithAI } from '../../../infra/ai/textProvider.js';
import { generateImagesWithComfy } from '../../../infra/ai/comfyClient.js';

export type StyleListItem = {
    id: string;
    name: string;
};

type GenerationJobParams = {
    count?: number;
    model?: string;
    creative_constraints?: string | null;
    styles?: string[];
    technicalAdvice?: string;
    locationSuggestions?: string[];
    improvedPrompt?: string;

    images_count?: number;
    prompt?: string;
    use_gear?: boolean;
    gear?: { type: string; brand: string; model: string }[];
};

export const createArtDirection = async (
    userId: string,
    input: CreateDaInput,
) => {
    const ad = await prisma.art_direction.create({
        data: {
            user_id: userId,
            title: input.title,
            brief: input.brief,
            use_gear: input.use_gear ?? false,
            status: input.status ?? 'draft',
        },
    });

    return ad;
};

export const listUserArtDirections = async (
    userId: string,
    filters: GetDaListQuery = {},
): Promise<GetDaListResponse> => {
    const where = {
        user_id: userId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.search
            ? {
                  OR: [
                      {
                          title: {
                              contains: filters.search,
                              mode: 'insensitive' as const,
                          },
                      },
                      {
                          brief: {
                              contains: filters.search,
                              mode: 'insensitive' as const,
                          },
                      },
                  ],
              }
            : {}),
    };

    const [rows, total] = await Promise.all([
        prisma.art_direction.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: {
                ad_style: {
                    include: {
                        style: { select: { libelle: true } },
                    },
                },
                picture_generated: {
                    select: { url: true },
                    orderBy: { created_at: 'desc' },
                },
                favorite: {
                    where: { user_id: userId },
                    select: { user_id: true },
                },
            },
        }),
        prisma.art_direction.count({ where }),
    ]);

    const data: DaListItem[] = rows.map((ad) => ({
        id: ad.id,
        title: ad.title,
        brief: ad.brief,
        use_gear: ad.use_gear,
        status: ad.status,
        created_at: ad.created_at,
        updated_at: ad.updated_at,
        styles: (ad.ad_style ?? []).map((s) => s.style.libelle),
        pictures: (ad.picture_generated ?? []).map((p) => p.url),
        isFavorite: (ad.favorite ?? []).length > 0,
    }));

    return { data, total };
};

export const getArtDirectionById = async (
    userId: string,
    artDirectionId: string,
) => {
    const ad = await prisma.art_direction.findFirst({
        where: {
            id: artDirectionId,
            user_id: userId,
        },
        include: {
            ad_place: true,
            ad_style: {
                include: { style: true },
            },
            picture_generated: true,
            generation_job: true,
            favorite: {
                where: { user_id: userId },
            },
            user: true,
        },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    const isFavorite = ad.favorite.length > 0;

    return {
        ...ad,
        isFavorite,
    };
};

export const updateArtDirection = async (
    userId: string,
    artDirectionId: string,
    data: UpdateDaInput,
) => {
    const updated = await prisma.art_direction.updateMany({
        where: {
            id: artDirectionId,
            user_id: userId,
        },
        data: {
            ...data,
            updated_at: new Date(),
        },
    });

    if (updated.count === 0) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    return prisma.art_direction.findUnique({
        where: { id: artDirectionId },
    });
};

export const deleteArtDirection = async (
    userId: string,
    artDirectionId: string,
) => {
    const deleted = await prisma.art_direction.deleteMany({
        where: {
            id: artDirectionId,
            user_id: userId,
        },
    });

    if (deleted.count === 0) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    return { success: true };
};

export const toggleFavoriteArtDirection = async (
    userId: string,
    artDirectionId: string,
) => {
    const key = {
        user_id_art_direction_id: {
            user_id: userId,
            art_direction_id: artDirectionId,
        },
    };

    const existing = await prisma.favorite.findUnique({ where: key });

    if (existing) {
        await prisma.favorite.delete({ where: key });
        return { isFavorite: false };
    }

    const ad = await prisma.art_direction.findFirst({
        where: { id: artDirectionId, user_id: userId },
        select: { id: true },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    await prisma.favorite.create({
        data: {
            user_id: userId,
            art_direction_id: artDirectionId,
        },
    });

    return { isFavorite: true };
};

export const listFavoriteArtDirections = async (
    userId: string,
): Promise<GetDaListResponse> => {
    const favorites = await prisma.favorite.findMany({
        where: { user_id: userId },
        include: {
            art_direction: {
                include: {
                    ad_style: {
                        include: {
                            style: { select: { libelle: true } },
                        },
                    },
                    picture_generated: {
                        select: { url: true },
                        orderBy: { created_at: 'desc' },
                    },
                },
            },
        },
        orderBy: {
            created_at: 'desc',
        },
    });

    const data: DaListItem[] = favorites.map((fav) => {
        const ad = fav.art_direction;
        return {
            id: ad.id,
            title: ad.title,
            brief: ad.brief,
            use_gear: ad.use_gear,
            status: ad.status,
            created_at: ad.created_at,
            updated_at: ad.updated_at,
            styles: (ad.ad_style ?? []).map((s) => s.style.libelle),
            pictures: (ad.picture_generated ?? []).map((p) => p.url),
            isFavorite: true,
        };
    });

    return {
        data,
        total: data.length,
    };
};

export const addPlaceToArtDirection = async (
    userId: string,
    artDirectionId: string,
    place: DaPlaceBodyInput,
) => {
    const ad = await prisma.art_direction.findFirst({
        where: { id: artDirectionId, user_id: userId },
        select: { id: true },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    const created = await prisma.ad_place.create({
        data: {
            art_direction_id: artDirectionId,
            name: place.name,
            address: place.address,
            lat: typeof place.lat === 'number' ? place.lat : undefined,
            lng: typeof place.lng === 'number' ? place.lng : undefined,
            maps_url: place.maps_url,
        },
    });

    return created;
};

export const removePlaceFromArtDirection = async (
    userId: string,
    placeId: string,
) => {
    const place = await prisma.ad_place.findFirst({
        where: { id: placeId },
        include: {
            art_direction: {
                select: { user_id: true },
            },
        },
    });

    if (!place || place.art_direction.user_id !== userId) {
        throw new Error('Lieu introuvable ou non autorisé');
    }

    await prisma.ad_place.delete({
        where: { id: placeId },
    });

    return { success: true };
};

export const setArtDirectionStyles = async (
    userId: string,
    input: SetDaStylesInput,
) => {
    const { art_direction_id, style_ids } = input;

    const ad = await prisma.art_direction.findFirst({
        where: { id: art_direction_id, user_id: userId },
        select: { id: true },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    await prisma.$transaction([
        prisma.ad_style.deleteMany({
            where: {
                art_direction_id,
                ...(style_ids.length > 0
                    ? { style_id: { notIn: style_ids } }
                    : {}),
            },
        }),
        prisma.ad_style.createMany({
            data: style_ids.map((styleId) => ({
                art_direction_id,
                style_id: styleId,
            })),
            skipDuplicates: true,
        }),
    ]);

    return { success: true };
};

export const setArtDirectionConstraints = async (
    userId: string,
    input: SetDaConstraintsInput,
) => {
    const { art_direction_id, constraints } = input;

    const ad = await prisma.art_direction.findFirst({
        where: { id: art_direction_id, user_id: userId },
        select: { id: true },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    await prisma.art_direction.update({
        where: { id: art_direction_id },
        data: {
            constraints: constraints.trim(),
            updated_at: new Date(),
        },
    });

    return { success: true };
};

export const listGenerationJobsForArtDirection = async (
    userId: string,
    params: ListGenerationJobsForDaParams,
): Promise<ListGenerationJobsResponse> => {
    const { art_direction_id } = params;

    const ad = await prisma.art_direction.findFirst({
        where: { id: art_direction_id, user_id: userId },
        select: { id: true },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    const jobs = await prisma.generation_job.findMany({
        where: {
            user_id: userId,
            art_direction_id,
        },
        orderBy: { started_at: 'desc' },
    });

    const data: GenerationJobListItem[] = jobs.map((job) => ({
        id: job.id,
        user_id: job.user_id,
        art_direction_id: job.art_direction_id,
        model: job.model,
        duration: job.duration ?? null,
        params: job.params ?? null,
        message: job.message ?? null,
        status: job.status,
        started_at: job.started_at ?? null,
        finished_at: job.finished_at ?? null,
    }));

    return {
        data,
        total: data.length,
    };
};

export const listGenerationJobsForUser = async (
    userId: string,
    filters: ListGenerationJobsQuery = {},
): Promise<ListGenerationJobsResponse> => {
    const where = {
        user_id: userId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.art_direction_id
            ? { art_direction_id: filters.art_direction_id }
            : {}),
        ...(filters.model ? { model: filters.model } : {}),
    };

    const jobs = await prisma.generation_job.findMany({
        where,
        orderBy: { started_at: 'desc' },
    });

    const data: GenerationJobListItem[] = jobs.map((job) => ({
        id: job.id,
        user_id: job.user_id,
        art_direction_id: job.art_direction_id,
        model: job.model,
        duration: job.duration ?? null,
        params: job.params ?? null,
        message: job.message ?? null,
        status: job.status,
        started_at: job.started_at ?? null,
        finished_at: job.finished_at ?? null,
    }));

    return {
        data,
        total: data.length,
    };
};

function buildFakeImages(count: number, seed: string) {
    return Array.from({ length: count }).map((_, i) => ({
        url: `https://picsum.photos/seed/${seed}-${i}/1024/1536`,
    }));
}

function buildFakeLocationSuggestions(): string[] {
    return [
        'Un lieu cohérent avec le style dominant (urbain, nature, industriel...).',
        'Un endroit avec une lumière intéressante (grandes fenêtres, arcades, ombres graphiques).',
        "Un environnement où le modèle peut interagir naturellement avec l’espace (escaliers, bancs, rues piétonnes, etc.).",
    ];
}

export const generateForArtDirection = async (
    userId: string,
    artDirectionId: string,
    input: GenerateDaBodyInput,
): Promise<GenerateDaResponse> => {
    const rawCount = input.count ?? 2;
    const count = Math.min(rawCount, 3);
    const model = input.model ?? 'default';
    const { creative_constraints, styles } = input;

    const ad = await prisma.art_direction.findFirst({
        where: { id: artDirectionId, user_id: userId },
        select: {
            id: true,
            brief: true,
            use_gear: true,
            constraints: true, // 👈 on récupère le texte stocké
        },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    // On combine : priorité au champ saisi pour cette génération,
    // sinon on retombe sur les contraintes stockées en BDD
    const trimmedFromInput = creative_constraints?.trim();
    const combinedConstraints =
        trimmedFromInput && trimmedFromInput.length > 0
            ? trimmedFromInput
            : ad.constraints ?? undefined;

    let gearList: { type: string; brand: string; model: string }[] = [];
    if (ad.use_gear) {
        const gear = await prisma.gear.findMany({
            where: { user_id: userId },
        });
        gearList = gear.map((g) => ({
            type: g.type,
            brand: g.brand,
            model: g.model,
        }));
    }

    const startedAt = new Date();

    const job = await prisma.generation_job.create({
        data: {
            user_id: userId,
            art_direction_id: ad.id,
            model,
            status: 'running',
            params: <GenerationJobParams>{
                count,
                model,
                creative_constraints: combinedConstraints ?? null,
                styles: styles ?? [],
            },
            started_at: startedAt,
        },
    });

    try {
        const refinement = await refinePromptWithAI({
            brief: ad.brief,
            styles: styles ?? [],
            creativeConstraints: combinedConstraints,
            useGear: ad.use_gear,
            gearList,
        });

        const improvedPrompt = refinement.improvedPrompt;
        const technicalAdvice = refinement.technicalAdvice;
        const locationSuggestions =
            refinement.locationSuggestions?.length > 0
                ? refinement.locationSuggestions
                : buildFakeLocationSuggestions();

        let images: { url: string }[] = [];

        try {
            images = await generateImagesWithComfy({
                prompt: improvedPrompt,
                negativePrompt:
                    'low quality, blurry, distorted face, extra limbs, bad anatomy, text, watermark, logo, deformed hands, oversaturated',
                batchSize: count,
            });
        } catch (e) {
            console.error('[DA] Erreur ComfyUI, fallback sur fake images', e);
            images = buildFakeImages(count, job.id);
        }

        const createdPictures = await prisma.$transaction(
            images.map((img) =>
                prisma.picture_generated.create({
                    data: {
                        art_direction_id: artDirectionId,
                        url: img.url,
                    },
                }),
            ),
        );

        const finishedAt = new Date();
        const durationSeconds = Math.max(
            0,
            Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000),
        );

        const baseParams: GenerationJobParams =
            (job.params as GenerationJobParams | null) ?? {};

        const updatedJob = await prisma.generation_job.update({
            where: { id: job.id },
            data: {
                status: 'succeeded',
                finished_at: finishedAt,
                duration: durationSeconds,
                message: null,
                params: {
                    ...baseParams,
                    technicalAdvice,
                    locationSuggestions,
                    improvedPrompt,
                },
            },
        });

        const jobDto: GenerationJobListItem = {
            id: updatedJob.id,
            user_id: updatedJob.user_id,
            art_direction_id: updatedJob.art_direction_id,
            model: updatedJob.model,
            duration: updatedJob.duration ?? null,
            params: updatedJob.params ?? null,
            message: updatedJob.message ?? null,
            status: updatedJob.status,
            started_at: updatedJob.started_at ?? null,
            finished_at: updatedJob.finished_at ?? null,
        };

        return {
            job: jobDto,
            pictures: createdPictures.map((p) => ({
                id: p.id,
                url: p.url,
            })),
            technicalAdvice,
            locationSuggestions,
            improvedPrompt,
        };
    } catch (err: unknown) {
        const message =
            err instanceof Error
                ? err.message
                : 'Erreur lors de la génération';

        await prisma.generation_job.update({
            where: { id: job.id },
            data: {
                status: 'failed',
                message,
                finished_at: new Date(),
            },
        });

        throw err;
    }
};

export async function enqueueGenerationJob(
    userId: string,
    artDirectionId: string,
    input: EnqueueGenerationJobInput,
) {
    const ad = await prisma.art_direction.findFirst({
        where: { id: artDirectionId, user_id: userId },
        select: { id: true },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    const job = await prisma.generation_job.create({
        data: {
            user_id: userId,
            art_direction_id: artDirectionId,
            model: input.model,
            status: 'queued',
            params: {
                images_count: input.images_count,
            },
        },
    });

    return job;
}

export const createImageGenerationJobForArtDirection = async (
    userId: string,
    artDirectionId: string,
    input: CreateImageGenerationJobInput,
) => {
    const ad = await prisma.art_direction.findFirst({
        where: {
            id: artDirectionId,
            user_id: userId,
        },
        include: {
            user: true,
        },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    let gearList: { type: string; brand: string; model: string }[] = [];
    if (ad.use_gear) {
        const gear = await prisma.gear.findMany({
            where: { user_id: userId },
        });
        gearList = gear.map((g) => ({
            type: g.type,
            brand: g.brand,
            model: g.model,
        }));
    }

    const prompt = buildPromptFromArtDirection({
        title: ad.title,
        brief: ad.brief,
        useGear: ad.use_gear,
        gearList,
    });

    const params = {
        prompt,
        use_gear: ad.use_gear,
        gear: gearList,
        images_count: input.images_count,
    };

    const job = await prisma.generation_job.create({
        data: {
            user_id: userId,
            art_direction_id: artDirectionId,
            model: input.model,
            status: 'queued',
            params,
        },
    });

    return job;
};

type BuildPromptInput = {
    title: string;
    brief: string;
    useGear: boolean;
    gearList: { type: string; brand: string; model: string }[];
};

function buildPromptFromArtDirection({
    title,
    brief,
    useGear,
    gearList,
}: BuildPromptInput): string {
    const base = `You are generating photo concepts for an art direction.\nTitle: ${title}\nBrief: ${brief}\n`;

    let gearPart = '';
    if (useGear && gearList.length > 0) {
        const gearLines = gearList
            .map((g) => `- ${g.type} ${g.brand} ${g.model}`)
            .join('\n');

        gearPart = `\nUse the following gear as reference (camera, lenses, lights):\n${gearLines}\n`;
    }

    return `${base}${gearPart}\nGenerate a detailed visual concept for each image.`;
}

export const listStyles = async (userId: string): Promise<StyleListItem[]> => {
    void userId;

    const rows = await prisma.style.findMany({
        orderBy: { libelle: 'asc' },
    });

    return rows.map((s) => ({
        id: s.id,
        name: s.libelle,
    }));
};
