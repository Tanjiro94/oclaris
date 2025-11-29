import prisma from '../../../infra/db/prismaClient.js';
import type { CreateGearSchema, UpdateGearSchema } from '../validator/gear.js';

export const createGearService = async (data: CreateGearSchema, userId: string) => {
    const gear = await prisma.gear.create({
        data: { ...data, user: { connect: { id: userId } } },
        select: { id: true, type: true, brand: true, model: true, created_at: true },
    });
    return { gear };
};

export const getGearService = async (userId: string) => {
    const items = await prisma.gear.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        select: { id: true, type: true, brand: true, model: true, created_at: true },
    });
    return { items };
};

export const getGearByIdService = async (id: string, userId: string) => {
    const gear = await prisma.gear.findFirst({
    where: { id, user_id: userId },
    select: { id: true, type: true, brand: true, model: true, created_at: true },
    });
    return { gear };
};

export const updateGearService = async (data: UpdateGearSchema, userId: string) => {
    const { id, ...patch } = data;

    const res = await prisma.gear.updateMany({
        where: { id, user_id: userId },
        data: patch,
    });
    if (res.count === 0) return null;

    const g = await prisma.gear.findFirst({
        where: { id, user_id: userId },
        select: { id: true, type: true, brand: true, model: true, created_at: true },
    });
    return { gear: g };
};

export const deleteGearService = async (id: string, userId: string) => {
    await prisma.gear.deleteMany({ where: { id, user_id: userId } });
    return { id };
};
