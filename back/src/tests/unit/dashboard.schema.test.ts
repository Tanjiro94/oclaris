import { dashboardSchema } from '../../modules/dashboard/validator/dashboard.js';

describe('dashboardSchema', () => {
test('valide un objet complet', () => {
    const sample = {
    bannerStat: {
        successRate30d: { title: 'Taux de réussite - 30j', value: 0.5, type: 'percentage' },
        satisfactionRate30d: { title: 'Taux de satisfaction - 30j', value: 0, type: 'percentage' },
        favorites30d: { title: 'Nombre de favoris - 30j', value: 3, type: '' },
        generations30d: { title: 'Nombre de générations - 30j', value: 6, type: '' },
    },
    stylesTop5: [
        { styleId: 'Minimal', libelle: 'Minimal', count: 2 },
        { styleId: 'Vintage', libelle: 'Vintage', count: 1 },
    ],
    latest4: [
        { id: 'ad1', styles: ['Minimal'], pictures: ['https://x/y.jpg'] },
        { id: 'ad2', styles: [], pictures: [] },
    ],
    activity: {
        days: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
        generations: [0,0,0,0,0,0,0],
        favorites:   [0,0,0,0,0,0,0],
        avg7d: { generations: 0, favorites: 0 },
    },
    };

    expect(() => dashboardSchema.parse(sample)).not.toThrow();
});

test('rejette un objet invalide', () => {
    const invalid = {
    satisfactionRate30d: 0,
    favorites30d: 'not-a-number',
    generations30d: 0,
    stylesTop5: [],
    latest4: [],
    activity: {
        days: [],
        generations: [],
        favorites: [],
        avg7d: { generations: 0, favorites: 0 },
    },
    } as unknown;

    expect(() => dashboardSchema.parse(invalid)).toThrow();
});
});