import { z } from 'zod';

export const dashboardSchema = z.object({
    successRate30d: z.number(),
    satisfactionRate30d: z.number(),
    favorites30d: z.number(),
    generations30d: z.number(),
    stylesTop5: z.array(z.object({
        style: z.string(),
        count: z.number(),
    })),
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