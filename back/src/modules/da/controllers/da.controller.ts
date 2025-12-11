import type { Request, Response, NextFunction } from 'express';
import AppError from '../../../core/errors/AppError.js';

import {
    createDaSchema,
    updateDaSchema,
    getDaByIdSchema,
    deleteDaSchema,
    getDaListSchema,
    toggleFavoriteDaSchema,
    listFavoriteDasSchema,
    daPlaceBodySchema,
    setDaStylesSchema,
    setDaConstraintsSchema,
    listGenerationJobsForDaSchema,
    listGenerationJobsSchema,
    generateDaBodySchema,
    enqueueGenerationJobSchema,
    createImageGenerationJobSchema,
} from '../validator/da.js';

import {
    createArtDirection,
    listUserArtDirections,
    getArtDirectionById,
    updateArtDirection,
    deleteArtDirection,
    toggleFavoriteArtDirection,
    listFavoriteArtDirections,
    addPlaceToArtDirection,
    removePlaceFromArtDirection,
    setArtDirectionStyles,
    setArtDirectionConstraints,
    listGenerationJobsForArtDirection,
    listGenerationJobsForUser,
    generateForArtDirection,
    enqueueGenerationJob,
    createImageGenerationJobForArtDirection,
    listStyles,
} from '../services/da.service.js';

export async function listDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const query = getDaListSchema.parse(req.query);
        const result = await listUserArtDirections(userId, query);

        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function getDaByIdController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);
        const ad = await getArtDirectionById(userId, id);

        res.status(200).json(ad);
    } catch (e) {
        next(e);
    }
}

export async function createDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const body = createDaSchema.parse(req.body);
        const ad = await createArtDirection(userId, body);

        res.status(201).json(ad);
    } catch (e) {
        next(e);
    }
}

export async function updateDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);
        const body = updateDaSchema.parse(req.body);

        const ad = await updateArtDirection(userId, id, body);
        res.status(200).json(ad);
    } catch (e) {
        next(e);
    }
}

export async function deleteDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = deleteDaSchema.parse(req.params);
        const result = await deleteArtDirection(userId, id);

        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function toggleFavoriteDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = toggleFavoriteDaSchema.parse(req.params);
        const result = await toggleFavoriteArtDirection(userId, id);

        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function listFavoriteDasController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        listFavoriteDasSchema.parse(req.query);
        const result = await listFavoriteArtDirections(userId);

        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function addPlaceToDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);
        const place = daPlaceBodySchema.parse(req.body);

        const created = await addPlaceToArtDirection(userId, id, place);
        res.status(201).json(created);
    } catch (e) {
        next(e);
    }
}

export async function removePlaceFromDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { placeId } = req.params;
        const result = await removePlaceFromArtDirection(userId, placeId);

        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function setDaStylesController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);

        const parsed = setDaStylesSchema.parse({
            art_direction_id: id,
            style_ids: req.body.style_ids,
        });

        const result = await setArtDirectionStyles(userId, parsed);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function setDaConstraintsController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);

        const parsed = setDaConstraintsSchema.parse({
            art_direction_id: id,
            constraints: req.body.constraints,
        });

        const result = await setArtDirectionConstraints(userId, parsed);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function listGenerationJobsForDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);

        const params = listGenerationJobsForDaSchema.parse({
            art_direction_id: id,
        });

        const result = await listGenerationJobsForArtDirection(userId, params);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function listGenerationJobsForUserController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const query = listGenerationJobsSchema.parse(req.query);
        const result = await listGenerationJobsForUser(userId, query);

        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function generateDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);
        const body = generateDaBodySchema.parse(req.body);

        const result = await generateForArtDirection(userId, id, body);

        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function enqueueDaGenerationController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = req.params;
        const body = enqueueGenerationJobSchema.parse(req.body);

        const job = await enqueueGenerationJob(userId, id, body);

        res.status(201).json(job);
    } catch (e) {
        next(e);
    }
}

export async function createImageGenerationJobForDaController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);
        const body = createImageGenerationJobSchema.parse(req.body);

        const job = await createImageGenerationJobForArtDirection(
            userId,
            id,
            body,
        );

        res.status(201).json(job);
    } catch (e) {
        next(e);
    }
}

export async function listStylesController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const data = await listStyles(userId);

        res.status(200).json(data);
    } catch (e) {
        next(e);
    }
}

export async function downloadDaImagesZipController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);

        const ad = await getArtDirectionById(userId, id);

        const pictures = ad.picture_generated as {
            id: string;
            url: string;
        }[];

        if (!pictures || pictures.length === 0) {
            throw new AppError(
                "Aucune image générée pour cette direction artistique.",
                404,
            );
        }

        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();

        for (const pic of pictures) {
            try {
                const imgRes = await fetch(pic.url);
                if (!imgRes.ok) {
                    console.warn(
                        `[DA-ZIP] Impossible de récupérer l'image ${pic.url} (${imgRes.status})`,
                    );
                    continue;
                }

                const arrayBuffer = await imgRes.arrayBuffer();
                const contentType = imgRes.headers.get('content-type') || '';
                let ext = 'jpg';

                if (contentType.includes('png')) ext = 'png';
                else if (contentType.includes('webp')) ext = 'webp';
                else if (contentType.includes('jpeg')) ext = 'jpg';

                zip.file(
                    `image-${pic.id}.${ext}`,
                    Buffer.from(arrayBuffer),
                );
            } catch (e) {
                console.warn(
                    `[DA-ZIP] Erreur lors du fetch de l'image ${pic.url}`,
                    e,
                );
            }
        }

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=art-direction-${id}.zip`,
        );
        res.send(zipBuffer);
    } catch (e) {
        next(e);
    }
}
