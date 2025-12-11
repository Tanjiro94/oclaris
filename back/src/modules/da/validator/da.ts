import { z } from 'zod';

export const adStatusSchema = z.enum(['draft', 'pending', 'ready', 'archived']);

export const jobStatusSchema = z.enum([
    'queued',
    'running',
    'succeeded',
    'failed',
    'cancelled',
]);

export const uuidSchema = z.string().uuid();

export const createDaSchema = z.object({
    title: z.string().min(1, 'Le titre est obligatoire'),
    brief: z.string().min(1, 'Le brief est obligatoire'),
    use_gear: z.boolean().default(false),
    status: adStatusSchema.default('draft'),
});

export const updateDaSchema = z
    .object({
        title: z.string().min(1).optional(),
        brief: z.string().min(1).optional(),
        use_gear: z.boolean().optional(),
        status: adStatusSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'Au moins un champ doit être fourni pour la mise à jour',
    });

export const getDaByIdSchema = z.object({
    id: uuidSchema,
});

export const deleteDaSchema = z.object({
    id: uuidSchema,
});

export const getDaListSchema = z.object({
    status: adStatusSchema.optional(),
    search: z.string().min(1).optional(),
});

export const toggleFavoriteDaSchema = z.object({
    id: uuidSchema,
});

export const listFavoriteDasSchema = z.object({});

export const daPlaceBodySchema = z.object({
    name: z.string().min(1, 'Le nom du lieu est obligatoire'),
    address: z.string().max(255).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    maps_url: z.string().url().optional(),
});

export const addPlaceToDaSchema = z.object({
    art_direction_id: uuidSchema,
    place: daPlaceBodySchema,
});

export const removePlaceFromDaSchema = z.object({
    place_id: uuidSchema,
});

export const setDaStylesSchema = z.object({
    art_direction_id: uuidSchema,
    style_ids: z.array(uuidSchema).default([]),
});

// 👉 Nouveau : contraintes = simple texte
export const setDaConstraintsSchema = z.object({
    art_direction_id: uuidSchema,
    constraints: z.string().min(1, 'Les contraintes créatives sont obligatoires'),
});

export const listGenerationJobsForDaSchema = z.object({
    art_direction_id: uuidSchema,
});

export const listGenerationJobsSchema = z.object({
    status: jobStatusSchema.optional(),
    art_direction_id: uuidSchema.optional(),
    model: z.string().optional(),
});

export const generationJobListItemSchema = z.object({
    id: uuidSchema,
    user_id: uuidSchema,
    art_direction_id: uuidSchema,
    model: z.string(),
    duration: z.number().int().min(0).nullable().optional(),
    params: z.unknown().nullable().optional(),
    message: z.string().nullable().optional(),
    status: jobStatusSchema,
    started_at: z.date().or(z.string()).nullable(),
    finished_at: z.date().or(z.string()).nullable(),
});

export const listGenerationJobsResponseSchema = z.object({
    data: z.array(generationJobListItemSchema),
    total: z.number(),
});

export const daListItemSchema = z.object({
    id: uuidSchema,
    title: z.string(),
    brief: z.string(),
    use_gear: z.boolean(),
    status: adStatusSchema,
    created_at: z.date().or(z.string()),
    updated_at: z.date().or(z.string()),
    styles: z.array(z.string()).default([]),
    pictures: z.array(z.string()).default([]),
    isFavorite: z.boolean().optional(),
});

export const getDaListResponseSchema = z.object({
    data: z.array(daListItemSchema),
    total: z.number(),
});

// 🔹 Body de génération enrichi
export const generateDaBodySchema = z.object({
    count: z.number().int().min(1).max(12).default(6),
    model: z.string().default('default'),
    creative_constraints: z.string().min(1).optional(),
    styles: z.array(z.string()).optional(),
});

export const generatedPictureSchema = z.object({
    id: uuidSchema,
    url: z.string().url(),
});

// 🔹 Réponse de génération enrichie avec improvedPrompt
export const generateDaResponseSchema = z.object({
    job: generationJobListItemSchema,
    pictures: z.array(generatedPictureSchema),
    technicalAdvice: z.string(),
    locationSuggestions: z.array(z.string()),
    improvedPrompt: z.string(),
});

export const enqueueGenerationJobSchema = z.object({
    model: z.string().min(1).default('sdxl'),
    images_count: z.number().int().min(1).max(8).default(4),
});

export const createImageGenerationJobSchema = z.object({
    model: z.string().default('image-basic-v1'),
    images_count: z.number().int().min(1).max(8).default(4),
});

export type CreateImageGenerationJobInput = z.infer<typeof createImageGenerationJobSchema>;
export type EnqueueGenerationJobInput = z.infer<typeof enqueueGenerationJobSchema>;

export type CreateDaInput = z.infer<typeof createDaSchema>;
export type UpdateDaInput = z.infer<typeof updateDaSchema>;

export type GetDaByIdParams = z.infer<typeof getDaByIdSchema>;
export type DeleteDaParams = z.infer<typeof deleteDaSchema>;
export type GetDaListQuery = z.infer<typeof getDaListSchema>;

export type ToggleFavoriteDaParams = z.infer<typeof toggleFavoriteDaSchema>;
export type ListFavoriteDasQuery = z.infer<typeof listFavoriteDasSchema>;

export type DaPlaceBodyInput = z.infer<typeof daPlaceBodySchema>;
export type AddPlaceToDaInput = z.infer<typeof addPlaceToDaSchema>;
export type RemovePlaceFromDaInput = z.infer<typeof removePlaceFromDaSchema>;
export type SetDaStylesInput = z.infer<typeof setDaStylesSchema>;
export type SetDaConstraintsInput = z.infer<typeof setDaConstraintsSchema>;

export type ListGenerationJobsForDaParams = z.infer<
    typeof listGenerationJobsForDaSchema
>;
export type ListGenerationJobsQuery = z.infer<typeof listGenerationJobsSchema>;
export type GenerationJobListItem = z.infer<typeof generationJobListItemSchema>;
export type ListGenerationJobsResponse = z.infer<
    typeof listGenerationJobsResponseSchema
>;

export type DaListItem = z.infer<typeof daListItemSchema>;
export type GetDaListResponse = z.infer<typeof getDaListResponseSchema>;

export type GenerateDaBodyInput = z.infer<typeof generateDaBodySchema>;
export type GenerateDaResponse = z.infer<typeof generateDaResponseSchema>;
