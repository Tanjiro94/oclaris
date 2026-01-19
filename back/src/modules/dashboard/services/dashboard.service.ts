import prisma from '../../../infra/db/prismaClient.js';
import { dashboardSchema, type DashboardSchema } from '../validator/dashboard.js';

export const dashboardService = async (userId: string): Promise<DashboardSchema> => {
    const now = new Date();
    const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // 1) Success rate : calculé uniquement sur les jobs terminés (succeeded + failed)
    const [nbFinishedGen30d, nbSucceededGen30d] = await Promise.all([
        prisma.generation_job.count({
            where: {
                user_id: userId,
                started_at: { gte: since },
                status: { in: ['succeeded', 'failed'] },
            },
        }),
        prisma.generation_job.count({
            where: {
                user_id: userId,
                started_at: { gte: since },
                status: 'succeeded',
            },
        }),
    ]);

    const successRate30d =
        nbFinishedGen30d > 0 ? (nbSucceededGen30d / nbFinishedGen30d) * 100 : 0;

    // 2) Satisfaction rate : favoris / DA créées sur 30 jours
    const [nbArtDirections30d, nbFavorites30d] = await Promise.all([
        prisma.art_direction.count({
            where: { user_id: userId, created_at: { gte: since } },
        }),
        prisma.favorite.count({
            where: { user_id: userId, created_at: { gte: since } },
        }),
    ]);

    const satisfactionRate30d =
        nbArtDirections30d > 0 ? (nbFavorites30d / nbArtDirections30d) * 100 : 0;

    // 3) Compteurs
    const nbGenerations30d = nbFinishedGen30d;

    // Latest 4
    const latest4Raw = await prisma.art_direction.findMany({
        where: { user_id: userId, created_at: { gte: since } },
        orderBy: { created_at: 'desc' },
        take: 4,
        select: {
            id: true,
            ad_style: {
                take: 3,
                orderBy: { created_at: 'desc' },
                select: {
                    style: { select: { libelle: true } },
                },
            },
            picture_generated: {
                take: 3,
                orderBy: { created_at: 'desc' },
                select: { url: true },
            },
        },
    });

    const latest4 = latest4Raw.map(ad => ({
        id: ad.id,
        styles: ad.ad_style.map(s => s.style.libelle),
        pictures: ad.picture_generated.map(p => p.url),
    }));

    // Styles Top 5
    type StyleRow = { styleId: string; libelle: string; count: number };

    const rows = await prisma.$queryRaw<StyleRow[]>`
        SELECT
            s.id AS "styleId",
            s.libelle,
            COALESCE(COUNT(DISTINCT ad.id), 0)::int AS "count"
        FROM "style" s
        LEFT JOIN "ad_style" as_ ON as_."style_id" = s.id
        LEFT JOIN "art_direction" ad
            ON ad.id = as_."art_direction_id"
        AND ad."user_id" = ${userId}::uuid
        AND ad."created_at" >= ${since}::timestamptz
        GROUP BY s.id, s.libelle
    `;

    let stylesTop5: { styleId: string; libelle: string; count: number }[];

    if (rows.some(r => r.count > 0)) {
        stylesTop5 = [...rows].sort((a, b) => b.count - a.count).slice(0, 5);
    } else {
        const fallback = await prisma.$queryRaw<StyleRow[]>`
            SELECT s.id AS "styleId", s.libelle, 0::int AS "count"
            FROM "style" s
            ORDER BY random()
            LIMIT 5
        `;
        stylesTop5 = fallback;
    }

    // Activity
    const { start, end, daysISO, labels } = getCurrentWeekBoundaries();

    const genRows = await prisma.$queryRaw<Array<{ day: string; count: number }>>`
        SELECT to_char(date_trunc('day', "started_at"), 'YYYY-MM-DD') AS day,
            COUNT(*)::int AS count
        FROM "generation_job"
        WHERE "user_id" = ${userId}::uuid
        AND "started_at" >= ${start}::timestamptz
        AND "started_at" <  ${end}::timestamptz
        GROUP BY 1
    `;

    const favRows = await prisma.$queryRaw<Array<{ day: string; count: number }>>`
        SELECT to_char(date_trunc('day', "created_at"), 'YYYY-MM-DD') AS day,
            COUNT(*)::int AS count
        FROM "favorite"
        WHERE "user_id" = ${userId}::uuid
        AND "created_at" >= ${start}::timestamptz
        AND "created_at" <  ${end}::timestamptz
        GROUP BY 1
    `;

    const genMap = new Map(genRows.map(r => [r.day, r.count]));
    const favMap = new Map(favRows.map(r => [r.day, r.count]));

    const generations = daysISO.map(d => genMap.get(d) ?? 0);
    const favorites = daysISO.map(d => favMap.get(d) ?? 0);

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / 7;
    const avg7d = {
        generations: avg(generations),
        favorites: avg(favorites),
    };

    const result = {
        bannerStat: {
            successRate30d: { title: 'Taux de réussite - 30j', value: successRate30d, type: 'percentage' },
            satisfactionRate30d: { title: 'Taux de satisfaction - 30j', value: satisfactionRate30d, type: 'percentage' },
            favorites30d: { title: 'Nombre de favoris - 30j', value: nbFavorites30d, type: '' },
            generations30d: { title: 'Nombre de générations - 30j', value: nbGenerations30d, type: '' },
        },
        stylesTop5,
        latest4,
        activity: {
            days: labels,
            generations,
            favorites,
            avg7d,
        },
    };

    return dashboardSchema.parse(result);
};

const getCurrentWeekBoundaries = () => {
    const now = new Date();

    const start = new Date(now);
    const day = start.getDay();
    const diffToMonday = (day + 6) % 7;
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - diffToMonday);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const daysISO: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        daysISO.push(toISODate(d));
    }
    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return { start, end, daysISO, labels };
};

const toISODate = (d: Date): string => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
};
