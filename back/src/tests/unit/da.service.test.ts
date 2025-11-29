import prisma from '../../infra/db/prismaClient.js';
import {
    createArtDirection,
    listUserArtDirections,
    listFavoriteArtDirections,
    listGenerationJobsForUser,
} from '../../modules/da/services/da.service.js';

type MockArtDirection = {
    id: string;
    user_id: string;
    title: string;
    brief: string;
    use_gear: boolean;
    status: 'draft' | 'pending' | 'ready' | 'archived';
    created_at: Date;
    updated_at: Date;
};

type MockFavorite = {
    user_id: string;
    art_direction_id: string;
    created_at: Date;
    art_direction: MockArtDirection;
};

describe('da services', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('createArtDirection crée une DA avec les bons champs', async () => {
        const userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

        const fakeCreated: MockArtDirection = {
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            user_id: userId,
            title: 'My DA',
            brief: 'Un brief',
            use_gear: true,
            status: 'draft',
            created_at: new Date(),
            updated_at: new Date(),
        };

        const spyCreate = jest
            .spyOn(prisma.art_direction, 'create')
            .mockResolvedValueOnce(fakeCreated);

        const result = await createArtDirection(userId, {
            title: 'My DA',
            brief: 'Un brief',
            use_gear: true,
            status: 'draft',
        });

        expect(spyCreate).toHaveBeenCalledWith({
            data: {
                user_id: userId,
                title: 'My DA',
                brief: 'Un brief',
                use_gear: true,
                status: 'draft',
            },
        });

        expect(result).toEqual(fakeCreated);
    });

    test('listUserArtDirections renvoie la liste formatée + total', async () => {
        const userId = 'user-123';

        const rows: MockArtDirection[] = [
            {
                id: 'ad-1',
                user_id: userId,
                title: 'DA 1',
                brief: 'Brief 1',
                use_gear: false,
                status: 'draft',
                created_at: new Date('2025-01-01T00:00:00.000Z'),
                updated_at: new Date('2025-01-02T00:00:00.000Z'),
            },
            {
                id: 'ad-2',
                user_id: userId,
                title: 'DA 2',
                brief: 'Brief 2',
                use_gear: true,
                status: 'ready',
                created_at: new Date('2025-02-01T00:00:00.000Z'),
                updated_at: new Date('2025-02-02T00:00:00.000Z'),
            },
        ];

        const spyFindMany = jest
            .spyOn(prisma.art_direction, 'findMany')
            .mockResolvedValueOnce(rows);

        const spyCount = jest
            .spyOn(prisma.art_direction, 'count')
            .mockResolvedValueOnce(2);

        const result = await listUserArtDirections(userId, {
            status: 'draft',
            search: 'portrait',
        });

        expect(spyFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    user_id: userId,
                    status: 'draft',
                }),
                orderBy: { created_at: 'desc' },
            }),
        );

        expect(spyCount).toHaveBeenCalledWith({
            where: {
                user_id: userId,
                status: 'draft',
                OR: [
                    { title: { contains: 'portrait', mode: 'insensitive' } },
                    { brief: { contains: 'portrait', mode: 'insensitive' } },
                ],
            },
        });

        expect(result.total).toBe(2);
        expect(result.data[0]).toMatchObject({
            id: 'ad-1',
            title: 'DA 1',
            brief: 'Brief 1',
            status: 'draft',
        });
    });

    test('listFavoriteArtDirections renvoie les DA favorites formatées', async () => {
        const userId = 'user-123';

        const favs: MockFavorite[] = [
            {
                user_id: userId,
                art_direction_id: 'ad-1',
                created_at: new Date(),
                art_direction: {
                    id: 'ad-1',
                    user_id: userId,
                    title: 'DA Favori',
                    brief: 'Brief Fav',
                    use_gear: true,
                    status: 'ready',
                    created_at: new Date('2025-01-01T00:00:00.000Z'),
                    updated_at: new Date('2025-01-02T00:00:00.000Z'),
                },
            },
        ];

        const spyFindFav = jest
            .spyOn(prisma.favorite, 'findMany')
            .mockResolvedValueOnce(favs);

        const result = await listFavoriteArtDirections(userId);

        expect(spyFindFav).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { user_id: userId },
                include: {
                    art_direction: expect.objectContaining({
                        include: expect.objectContaining({
                            ad_style: expect.any(Object),
                            picture_generated: expect.any(Object),
                        }),
                    }),
                },
                orderBy: { created_at: 'desc' },
            }),
        );

        expect(result.total).toBe(1);
        expect(result.data[0]).toMatchObject({
            id: 'ad-1',
            title: 'DA Favori',
            status: 'ready',
        });
    });

    test('listGenerationJobsForUser applique correctement les filtres', async () => {
        const userId = 'user-123';

        const jobs = [
            {
                id: 'job-1',
                user_id: userId,
                art_direction_id: 'ad-1',
                model: 'sdxl',
                duration: 120,
                params: { foo: 'bar' },
                message: null,
                status: 'succeeded' as const,
                started_at: new Date('2025-03-01T00:00:00.000Z'),
                finished_at: new Date('2025-03-01T00:05:00.000Z'),
                // au cas où ton modèle a ces champs :
                created_at: new Date('2025-03-01T00:00:00.000Z'),
                updated_at: new Date('2025-03-01T00:05:00.000Z'),
            },
        ] as unknown as Awaited<
            ReturnType<(typeof prisma.generation_job)['findMany']>
        >;

        const spyFindJobs = jest
            .spyOn(prisma.generation_job, 'findMany')
            .mockResolvedValueOnce(jobs);

        const result = await listGenerationJobsForUser(userId, {
            status: 'succeeded',
            model: 'sdxl',
            art_direction_id: 'ad-1',
        });

        expect(spyFindJobs).toHaveBeenCalledWith({
            where: {
                user_id: userId,
                status: 'succeeded',
                art_direction_id: 'ad-1',
                model: 'sdxl',
            },
            orderBy: { started_at: 'desc' },
        });

        expect(result.total).toBe(1);
        expect(result.data[0]).toMatchObject({
            id: 'job-1',
            art_direction_id: 'ad-1',
            model: 'sdxl',
            status: 'succeeded',
        });
    });
});
