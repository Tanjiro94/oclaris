import { ZodError } from 'zod';
import {
    adStatusSchema,
    createDaSchema,
    updateDaSchema,
    getDaByIdSchema,
    getDaListSchema,
    listGenerationJobsSchema,
    daListItemSchema,
    generateDaBodySchema,
    enqueueGenerationJobSchema,
    createImageGenerationJobSchema,
} from '../../modules/da/validator/da.js';

describe('da schemas (zod)', () => {
    describe('adStatusSchema', () => {
        it('accepte les statuts valides', () => {
            expect(adStatusSchema.parse('draft')).toBe('draft');
            expect(adStatusSchema.parse('pending')).toBe('pending');
            expect(adStatusSchema.parse('ready')).toBe('ready');
            expect(adStatusSchema.parse('archived')).toBe('archived');
        });

        it('rejette un statut invalide', () => {
            expect(() => adStatusSchema.parse('published')).toThrow(ZodError);
        });
    });

    describe('createDaSchema', () => {
        it('accepte un payload valide', () => {
            const data = createDaSchema.parse({
                title: 'Direction artistique test',
                brief: 'Un brief bien détaillé',
                use_gear: true,
                status: 'pending',
            });

            expect(data).toEqual({
                title: 'Direction artistique test',
                brief: 'Un brief bien détaillé',
                use_gear: true,
                status: 'pending',
            });
        });

        it('applique les valeurs par défaut (use_gear=false, status=draft)', () => {
            const data = createDaSchema.parse({
                title: 'Sans options',
                brief: 'Juste un brief',
            });

            expect(data.use_gear).toBe(false);
            expect(data.status).toBe('draft');
        });

        it('rejette un titre vide', () => {
            expect(() =>
                createDaSchema.parse({
                    title: '',
                    brief: 'Ok',
                }),
            ).toThrow(ZodError);
        });

        it('rejette un brief vide', () => {
            expect(() =>
                createDaSchema.parse({
                    title: 'Ok',
                    brief: '',
                }),
            ).toThrow(ZodError);
        });
    });

    describe('updateDaSchema', () => {
        it('accepte un patch partiel valide', () => {
            const data = updateDaSchema.parse({
                title: 'Nouveau titre',
            });

            expect(data).toEqual({ title: 'Nouveau titre' });
        });

        it('rejette un patch vide (aucun champ fourni)', () => {
            expect(() => updateDaSchema.parse({})).toThrow(ZodError);
        });

        it('rejette un titre vide', () => {
            expect(() =>
                updateDaSchema.parse({
                    title: '',
                }),
            ).toThrow(ZodError);
        });
    });

    describe('getDaByIdSchema', () => {
        const validId = '550e8400-e29b-41d4-a716-446655440000';

        it('accepte un uuid valide', () => {
            const data = getDaByIdSchema.parse({ id: validId });
            expect(data).toEqual({ id: validId });
        });

        it('rejette un id invalide', () => {
            expect(() => getDaByIdSchema.parse({ id: 'not-a-uuid' })).toThrow(
                ZodError,
            );
        });
    });

    describe('getDaListSchema', () => {
        it('accepte un payload vide', () => {
            const data = getDaListSchema.parse({});
            expect(data.status).toBeUndefined();
            expect(data.search).toBeUndefined();
        });

        it('accepte un filtrage par status', () => {
            const data = getDaListSchema.parse({ status: 'draft' });
            expect(data.status).toBe('draft');
        });

        it('accepte un filtrage par search', () => {
            const data = getDaListSchema.parse({ search: 'portrait' });
            expect(data.search).toBe('portrait');
        });

        it('rejette un status invalide', () => {
            expect(() =>
                getDaListSchema.parse({ status: 'published' }),
            ).toThrow(ZodError);
        });
    });

    describe('listGenerationJobsSchema', () => {
        const validId = '550e8400-e29b-41d4-a716-446655440000';

        it('accepte des filtres valides', () => {
            const data = listGenerationJobsSchema.parse({
                status: 'succeeded',
                model: 'sdxl',
                art_direction_id: validId,
            });

            expect(data).toEqual({
                status: 'succeeded',
                model: 'sdxl',
                art_direction_id: validId,
            });
        });

        it('rejette un art_direction_id invalide', () => {
            expect(() =>
                listGenerationJobsSchema.parse({
                    art_direction_id: 'not-a-uuid',
                }),
            ).toThrow(ZodError);
        });
    });

    describe('daListItemSchema', () => {
        it('applique les valeurs par défaut pour styles/pictures/isFavorite', () => {
            const validId = '550e8400-e29b-41d4-a716-446655440000';
            const data = daListItemSchema.parse({
                id: validId,
                title: 'Titre',
                brief: 'Brief',
                use_gear: false,
                status: 'draft',
                created_at: new Date(),
                updated_at: new Date(),
            });

            expect(Array.isArray(data.styles)).toBe(true);
            expect(Array.isArray(data.pictures)).toBe(true);
            expect(data.styles).toEqual([]);
            expect(data.pictures).toEqual([]);
            // isFavorite est optionnel, donc undefined par défaut si pas fourni
            expect(data.isFavorite).toBeUndefined();
        });
    });

    describe('generateDaBodySchema', () => {
        it('applique les valeurs par défaut', () => {
            const data = generateDaBodySchema.parse({});
            expect(data.count).toBe(6);
            expect(data.model).toBe('default');
        });

        it('rejette un count hors bornes', () => {
            expect(() =>
                generateDaBodySchema.parse({ count: 0 }),
            ).toThrow(ZodError);
            expect(() =>
                generateDaBodySchema.parse({ count: 50 }),
            ).toThrow(ZodError);
        });
    });

    describe('enqueueGenerationJobSchema', () => {
        it('applique les valeurs par défaut', () => {
            const data = enqueueGenerationJobSchema.parse({});
            expect(data.model).toBe('sdxl');
            expect(data.images_count).toBe(4);
        });

        it('rejette un images_count invalide', () => {
            expect(() =>
                enqueueGenerationJobSchema.parse({ images_count: 0 }),
            ).toThrow(ZodError);
            expect(() =>
                enqueueGenerationJobSchema.parse({ images_count: 20 }),
            ).toThrow(ZodError);
        });
    });

    describe('createImageGenerationJobSchema', () => {
        it('applique les valeurs par défaut', () => {
            const data = createImageGenerationJobSchema.parse({});
            expect(data.model).toBe('image-basic-v1');
            expect(data.images_count).toBe(4);
        });

        it('rejette un images_count invalide', () => {
            expect(() =>
                createImageGenerationJobSchema.parse({ images_count: 0 }),
            ).toThrow(ZodError);
            expect(() =>
                createImageGenerationJobSchema.parse({ images_count: 20 }),
            ).toThrow(ZodError);
        });
    });
});
