import { z } from 'zod';

export const createGearSchema = z.object({
    type: z.enum(['camera', 'lens', 'flash', 'accessory']),
    brand: z.string().min(1),
    model: z.string().min(1),
});

export const updateGearSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['camera', 'lens', 'flash', 'accessory']).optional(),
    brand: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
});

export const gearTypeSchema = z.enum(['camera', 'lens', 'flash', 'accessory']);

export type Gear = {
    id: string;
    user_id: string;
    type: GearType;
    brand: string;
    model: string;
    created_at: Date;
};

export type CreateGearSchema = z.infer<typeof createGearSchema>;
export type UpdateGearSchema = z.infer<typeof updateGearSchema>;
export type GearType = z.infer<typeof gearTypeSchema>;