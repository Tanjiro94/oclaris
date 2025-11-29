import { ZodError } from 'zod';
import {createGearSchema, updateGearSchema} from '../../modules/gear/validator/gear.js';

describe('gear schemas (zod)', () => {
describe('createGearSchema', () => {
    it('accepte un payload valide', () => {
    const data = createGearSchema.parse({
        type: 'camera',
        brand: 'Sony',
        model: 'A7III',
    });
    expect(data).toEqual({ type: 'camera', brand: 'Sony', model: 'A7III' });
    });

    it('rejette un type invalide', () => {
    expect(() =>
        createGearSchema.parse({
        type: 'body',
        brand: 'Sony',
        model: 'A7III',
        }),
    ).toThrow(ZodError);
    });

    it('rejette une marque vide', () => {
    expect(() =>
        createGearSchema.parse({
        type: 'camera',
        brand: '',
        model: 'A7III',
        }),
    ).toThrow(ZodError);
    });

    it('rejette un modèle vide', () => {
    expect(() =>
        createGearSchema.parse({
        type: 'camera',
        brand: 'Sony',
        model: '',
        }),
    ).toThrow(ZodError);
    });
});

describe('updateGearSchema', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('accepte un patch valide (id + un champ)', () => {
    const data = updateGearSchema.parse({
        id: validId,
        brand: 'Sigma',
    });
    expect(data).toEqual({ id: validId, brand: 'Sigma' });
    });

    it('rejette un id non-uuid', () => {
    expect(() =>
        updateGearSchema.parse({ id: 'not-a-uuid', brand: 'Sigma' }),
    ).toThrow(ZodError);
    });

    it('rejette une marque vide', () => {
    expect(() =>
        updateGearSchema.parse({ id: validId, brand: '' }),
    ).toThrow(ZodError);
    });

    it('accepte un patch avec seulement id (comportement actuel)', () => {
    const data = updateGearSchema.parse({ id: validId });
    expect(data).toEqual({ id: validId });
    });
});
});
