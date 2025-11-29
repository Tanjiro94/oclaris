import prisma from '../../../infra/db/prismaClient.js';

import type { CreateDaInput, UpdateDaInput, GetDaListQuery, GetDaListResponse, DaListItem, DaPlaceBodyInput, SetDaStylesInput, SetDaConstraintsInput, ListGenerationJobsForDaParams, ListGenerationJobsQuery, ListGenerationJobsResponse, GenerationJobListItem } from '../validator/da.js';

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
            ad_constraint: {
                include: {
                    constraint_option: {
                        include: { constraint_type: true },
                    },
                },
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
    /* _filters: ListFavoriteDasQuery = {}, */
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
    const { art_direction_id, constraint_option_ids } = input;

    const ad = await prisma.art_direction.findFirst({
        where: { id: art_direction_id, user_id: userId },
        select: { id: true },
    });

    if (!ad) {
        throw new Error('Direction artistique introuvable ou non autorisée');
    }

    await prisma.$transaction([
        prisma.ad_constraint.deleteMany({
            where: {
                art_direction_id,
                ...(constraint_option_ids.length > 0
                    ? { constraint_option_id: { notIn: constraint_option_ids } }
                    : {}),
            },
        }),
        prisma.ad_constraint.createMany({
            data: constraint_option_ids.map((optionId) => ({
                art_direction_id,
                constraint_option_id: optionId,
            })),
            skipDuplicates: true,
        }),
    ]);

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
