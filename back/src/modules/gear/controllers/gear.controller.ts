import type { Request, Response, NextFunction } from "express";
import AppError from "../../../core/errors/AppError.js";
import { createGearSchema, updateGearSchema } from "../validator/gear.js";
import {createGearService, getGearService, getGearByIdService, updateGearService, deleteGearService} from "../services/gear.service.js";

export async function getGear(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id; if (!userId) throw new AppError("Non autorisé", 401);
        const { items } = await getGearService(userId);
        res.json({ items });
    } catch (e) { next(e); }
}

export async function getGearById(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id; if (!userId) throw new AppError("Non autorisé", 401);
        const { id } = req.params;
        const { gear } = await getGearByIdService(id, userId);
        if (!gear) throw new AppError("Not found", 404);
        res.json({ gear });
    } catch (e) { next(e); }
}

export async function createGear(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id; if (!userId) throw new AppError("Non autorisé", 401);
        const body = createGearSchema.parse(req.body);
        const { gear } = await createGearService(body, userId);
        res.status(201).json({ gear });
    } catch (e) { next(e); }
}

export async function updateGear(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id; if (!userId) throw new AppError("Non autorisé", 401);
        const body = updateGearSchema.parse(req.body);
        const gear = await updateGearService(body, userId);
        if (!gear) throw new AppError("Not found", 404);
        res.json({ gear });
    } catch (e) { next(e); }
}

export async function deleteGear(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id; if (!userId) throw new AppError("Non autorisé", 401);
        const { id } = req.params;
        const ok = await deleteGearService(id, userId);
        if (!ok) throw new AppError("Not found", 404);
        res.status(204).send();
    } catch (e) { next(e); }
}
