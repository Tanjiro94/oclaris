import prisma from '../../../infra/db/prismaClient.js';
import { dashboardSchema, type DashboardSchema } from '../validator/dashboard.js';

export const dashboardService = async (userId: string) : Promise<DashboardSchema> => {
    const now = new Date();
    const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const totalGen = await prisma.generation_job.count({
        where: { user_id: userId, started_at: { gte: since } },
    });
    
    const succeeded = await prisma.generation_job.count({
        where: { user_id: userId, status: 'succeeded', started_at: { gte: since } },
    });

    const successRate30d = totalGen > 0 ? succeeded / totalGen : 0;
    const satisfactionRate30d = 0;
    const nbGenerations30d = totalGen;
    const nbFavorites30d = await prisma.favorite.count({
        where: { user_id: userId, created_at: { gte: since } },
    });

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

    const grouped = await prisma.ad_style.groupBy({
        by: ['style_id'],
        where: {
        art_direction: {
            created_at: { gte: since },
            user_id: userId,
        },
        },
        _count: { style_id: true },
        orderBy: { _count: { style_id: 'desc' } },
        take: 5,
    });
    
    const styleIds = grouped.map(g => g.style_id);
    
    const styles = await prisma.style.findMany({
        where: { id: { in: styleIds } },
        select: { id: true, libelle: true },
    });
    
    const stylesTop5 = grouped.map(g => ({
        style: styles.find(s => s.id === g.style_id)?.libelle ?? g.style_id,
        count: g._count.style_id,
    }));

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
    const favorites   = daysISO.map(d => favMap.get(d) ?? 0);

    const avg = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / 7);
    const avg7d = {
        generations: avg(generations),
        favorites: avg(favorites),
    };


    const result = {
        successRate30d,
        satisfactionRate30d,
        favorites30d: nbFavorites30d,
        generations30d: nbGenerations30d,
        stylesTop5: stylesTop5,
        latest4: latest4, 
        activity: {
            days: labels,
            generations: generations,
            favorites: favorites,
            avg7d: avg7d,
        },
    };

    return dashboardSchema.parse(result);
}


const getCurrentWeekBoundaries = () =>{
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
}

const toISODate = (d: Date): string => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
}