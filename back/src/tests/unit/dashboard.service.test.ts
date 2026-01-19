import { dashboardService } from '../../modules/dashboard/services/dashboard.service.js';
import prisma from '../../infra/db/prismaClient.js';

jest.mock('../../infra/db/prismaClient.js', () => ({
__esModule: true,
default: {
    generation_job: { count: jest.fn() },
    favorite: { count: jest.fn() },
    art_direction: { count: jest.fn(), findMany: jest.fn() },
    $queryRaw: jest.fn(),
},
}));

describe('dashboardService (unit)', () => {
const userId = 'user-123';

beforeEach(() => {
    jest.clearAllMocks();
});

test('retourne des zéros et tableaux vides quand pas de données', async () => {
    // success rate
    (prisma.generation_job.count as jest.Mock)
    .mockResolvedValueOnce(0) // nbFinishedGen30d
    .mockResolvedValueOnce(0); // nbSucceededGen30d

    // satisfaction
    (prisma.art_direction.count as jest.Mock).mockResolvedValueOnce(0); // nbArtDirections30d
    (prisma.favorite.count as jest.Mock).mockResolvedValueOnce(0); // nbFavorites30d

    // latest4
    (prisma.art_direction.findMany as jest.Mock).mockResolvedValueOnce([]);

    // $queryRaw (ordre exact dans le service)
    // 1) styles rows
    // 2) fallback random styles (car rows = [])
    // 3) genRows activity
    // 4) favRows activity
    (prisma.$queryRaw as jest.Mock)
    .mockResolvedValueOnce([]) // styles rows
    .mockResolvedValueOnce([]) // fallback styles
    .mockResolvedValueOnce([]) // genRows
    .mockResolvedValueOnce([]); // favRows

    const result = await dashboardService(userId);

    expect(result.bannerStat.successRate30d.value).toBe(0);
    expect(result.bannerStat.satisfactionRate30d.value).toBe(0);
    expect(result.bannerStat.generations30d.value).toBe(0);
    expect(result.bannerStat.favorites30d.value).toBe(0);

    expect(result.stylesTop5).toEqual([]);
    expect(result.latest4).toEqual([]);

    expect(result.activity.days).toHaveLength(7);
    expect(result.activity.generations).toHaveLength(7);
    expect(result.activity.favorites).toHaveLength(7);
    expect(result.activity.generations.every((n: number) => n === 0)).toBe(true);
    expect(result.activity.favorites.every((n: number) => n === 0)).toBe(true);
    expect(result.activity.avg7d.generations).toBe(0);
    expect(result.activity.avg7d.favorites).toBe(0);
});
});
