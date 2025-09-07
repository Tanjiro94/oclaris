import { dashboardService } from '../../modules/dashboard/services/dashboard.service.js';
import prisma from '../../infra/db/prismaClient.js';

jest.mock('../../infra/db/prismaClient.js', () => ({
__esModule: true,
default: {
    generation_job: {
    count: jest.fn(),
    },
    favorite: {
    count: jest.fn(),
    },
    art_direction: {
    findMany: jest.fn(),
    },
    ad_style: {
    groupBy: jest.fn(),
    },
    style: {
    findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
},
}));

describe('dashboardService (unit)', () => {
const userId = 'user-123';

beforeEach(() => {
    jest.clearAllMocks();
});

test('retourne des zéros et tableaux vides quand pas de données', async () => {
    (prisma.generation_job.count as jest.Mock).mockResolvedValueOnce(0); 
    (prisma.generation_job.count as jest.Mock).mockResolvedValueOnce(0); 
    (prisma.favorite.count as jest.Mock).mockResolvedValueOnce(0);       
    (prisma.art_direction.findMany as jest.Mock).mockResolvedValueOnce([]); 
    (prisma.ad_style.groupBy as jest.Mock).mockResolvedValueOnce([]);       
    (prisma.style.findMany as jest.Mock).mockResolvedValueOnce([]);         
    (prisma.$queryRaw as jest.Mock)
    .mockResolvedValueOnce([]) 
    .mockResolvedValueOnce([]); 

    const result = await dashboardService(userId);

    expect(result.successRate30d).toBe(0);
    expect(result.satisfactionRate30d).toBe(0);
    expect(result.generations30d).toBe(0);
    expect(result.favorites30d).toBe(0);

    expect(result.stylesTop5).toEqual([]);
    expect(result.latest4).toEqual([]);

    expect(result.activity.days.length).toBe(7);
    expect(result.activity.generations.length).toBe(7);
    expect(result.activity.favorites.length).toBe(7);
    expect(result.activity.generations.every(n => n === 0)).toBe(true);
    expect(result.activity.favorites.every(n => n === 0)).toBe(true);
    expect(result.activity.avg7d.generations).toBe(0);
    expect(result.activity.avg7d.favorites).toBe(0);
});
});