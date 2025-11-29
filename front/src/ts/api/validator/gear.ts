import { z } from 'zod';

export const createGearSchema = z.object({
    type: z.enum(['camera','lens','flash','accessory']),
    brand: z.string().min(1),
    model: z.string().min(1),
});

export type CreateGearDto = z.infer<typeof createGearSchema>;

export const updateGearSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['camera','lens','flash','accessory']).optional(),
    brand: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
});
export type UpdateGearDto = z.infer<typeof updateGearSchema>;

export const gearItemSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['camera','lens','flash','accessory']),
    brand: z.string(),
    model: z.string(),
    created_at: z.string().or(z.date()),
});
export type GearItem = z.infer<typeof gearItemSchema>;
