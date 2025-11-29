import type { Request, Response, NextFunction } from 'express';
import AppError from '../../../core/errors/AppError.js';

import { createDaSchema, updateDaSchema, getDaByIdSchema, deleteDaSchema, getDaListSchema, toggleFavoriteDaSchema, listFavoriteDasSchema, daPlaceBodySchema, setDaStylesSchema, setDaConstraintsSchema, listGenerationJobsForDaSchema, listGenerationJobsSchema} from '../validator/da.js';

import { createArtDirection, listUserArtDirections, getArtDirectionById, updateArtDirection, deleteArtDirection, toggleFavoriteArtDirection, listFavoriteArtDirections, addPlaceToArtDirection,removePlaceFromArtDirection, setArtDirectionStyles, setArtDirectionConstraints, listGenerationJobsForArtDirection, listGenerationJobsForUser} from '../services/da.service.js';

export async function listDaController(req: Request, res: Response, next: NextFunction) {
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

export async function getDaByIdController(req: Request, res: Response, next: NextFunction) {
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

export async function createDaController(req: Request, res: Response, next: NextFunction) {
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

export async function updateDaController(req: Request, res: Response, next: NextFunction) {
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

export async function deleteDaController(req: Request, res: Response, next: NextFunction) {
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

export async function toggleFavoriteDaController(req: Request, res: Response, next: NextFunction) {
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

export async function listFavoriteDasController(req: Request, res: Response, next: NextFunction) {
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

export async function addPlaceToDaController(req: Request, res: Response, next: NextFunction) {
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

export async function removePlaceFromDaController(req: Request, res: Response, next: NextFunction) {
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

export async function setDaStylesController(req: Request, res: Response, next: NextFunction) {
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

export async function setDaConstraintsController(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError('Non autorisé', 401);

        const { id } = getDaByIdSchema.parse(req.params);

        const parsed = setDaConstraintsSchema.parse({
        art_direction_id: id,
        constraint_option_ids: req.body.constraint_option_ids,
        });

        const result = await setArtDirectionConstraints(userId, parsed);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

export async function listGenerationJobsForDaController(req: Request, res: Response, next: NextFunction) {
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

export async function listGenerationJobsForUserController(req: Request, res: Response, next: NextFunction) {
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
