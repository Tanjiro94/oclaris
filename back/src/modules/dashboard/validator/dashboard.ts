import { object, z } from 'zod';

export const dashboardSchema = z.object({
    bannerStat : object({
        successRate30d: object({
            title : z.string(),
            value : z.number(),
            type : z.string(),
        }),
        satisfactionRate30d: object({
            title : z.string(),
            value : z.number(),
            type : z.string(),
        }),
        favorites30d: object({
            title : z.string(),
            value : z.number(),
            type : z.string(),
        }),
        generations30d: object({
            title : z.string(),
            value : z.number(),
            type : z.string(),
        }),
    }),
    stylesTop5: z.array(z.object({
        styleId: z.string(),
        libelle: z.string(),
        count: z.number(),
    })).max(5),
    latest4: z.array(
        z.object({
            id: z.string(),
            styles: z.array(z.string()).max(3),
            pictures: z.array(z.string()).max(3),
        })
    ),
    activity: z.object({
        days: z.array(z.string()),
        generations: z.array(z.number()),
        favorites: z.array(z.number()),
        avg7d: z.object({
        generations: z.number(),
        favorites: z.number(),
        }),
    }),
});

export type DashboardSchema = z.infer<typeof dashboardSchema>;