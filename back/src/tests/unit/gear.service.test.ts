
import { jest, describe, test, expect, afterEach } from '@jest/globals';
import type { Gear as GearType } from '../../modules/gear/validator/gear.js';

jest.mock('../../infra/db/prismaClient.js', () => ({
__esModule: true,
default: {
    gear: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    },
},
}));

import prisma from '../../infra/db/prismaClient.js';
import {
createGearService,
getGearService,
getGearByIdService,
updateGearService,
deleteGearService,
} from '../../modules/gear/services/gear.service.js';

const prismaMock = prisma.gear as unknown as {
create: jest.MockedFunction<typeof prisma.gear.create>;
findMany: jest.MockedFunction<typeof prisma.gear.findMany>;
findFirst: jest.MockedFunction<typeof prisma.gear.findFirst>;
updateMany: jest.MockedFunction<typeof prisma.gear.updateMany>;
deleteMany: jest.MockedFunction<typeof prisma.gear.deleteMany>;
};

const USER_ID = '11111111-1111-1111-1111-111111111111';
const GEAR_ID = '22222222-2222-2222-2222-222222222222';
const FIXED_DATE = new Date('2024-01-01T12:00:00Z');

const mockGear: GearType = {
id: GEAR_ID,
user_id: USER_ID,
type: 'camera',
brand: 'Sony',
model: 'A7III',
created_at: FIXED_DATE
};

describe('gear.service (unit)', () => {
afterEach(() => {
    jest.resetAllMocks();
});

test('createGearService crée un gear pour le user', async () => {
    prismaMock.create.mockResolvedValue(mockGear);

    const { gear } = await createGearService(
    { type: 'camera', brand: 'Sony', model: 'A7III' },
    USER_ID
    );

    expect(prismaMock.create).toHaveBeenCalledWith({
    data: {
        type: 'camera',
        brand: 'Sony',
        model: 'A7III',
        user: { connect: { id: USER_ID } },
    },
    select: { id: true, type: true, brand: true, model: true, created_at: true },
    });
    
    expect(gear.id).toBe(GEAR_ID);
    expect(gear.created_at).toEqual(FIXED_DATE);
});

test('getGearService liste le gear du user', async () => {
    prismaMock.findMany.mockResolvedValue([mockGear]);

    const { items } = await getGearService(USER_ID);

    expect(prismaMock.findMany).toHaveBeenCalledWith({
    where: { user_id: USER_ID },
    orderBy: { created_at: 'desc' },
    select: { id: true, type: true, brand: true, model: true, created_at: true },
    });
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(GEAR_ID);
});

test('getGearByIdService respecte le scoping user', async () => {
    prismaMock.findFirst.mockResolvedValue({ 
    ...mockGear, 
    type: 'lens', 
    model: '50mm' 
    });

    const { gear } = await getGearByIdService(GEAR_ID, USER_ID);

    expect(prismaMock.findFirst).toHaveBeenCalledWith({
    where: { id: GEAR_ID, user_id: USER_ID },
    select: { id: true, type: true, brand: true, model: true, created_at: true },
    });

    expect(gear).not.toBeNull();
    if (gear) {
        expect(gear.type).toBe('lens');
    }
});

test('updateGearService met à jour si le gear appartient au user', async () => {
    prismaMock.updateMany.mockResolvedValue({ count: 1 });
    
    prismaMock.findFirst.mockResolvedValue({ 
        ...mockGear, 
        brand: 'Godox', 
        type: 'flash', 
        model: 'V1' 
    });

    const result = await updateGearService({ id: GEAR_ID, brand: 'Godox' }, USER_ID);
    
    expect(result).not.toBeNull();
    if (!result) return; 

    const { gear } = result;

    expect(prismaMock.updateMany).toHaveBeenCalledWith({
    where: { id: GEAR_ID, user_id: USER_ID },
    data: { brand: 'Godox' },
    });

    expect(prismaMock.findFirst).toHaveBeenCalled(); 
    expect(gear?.brand).toBe('Godox');
});

test('updateGearService retourne null si aucun gear match', async () => {
    prismaMock.updateMany.mockResolvedValue({ count: 0 });

    const result = await updateGearService({ id: GEAR_ID, brand: 'X' }, USER_ID);
    
    expect(result).toBeNull();
    
    expect(prismaMock.updateMany).toHaveBeenCalled();
    expect(prismaMock.findFirst).not.toHaveBeenCalled();
});

test('deleteGearService supprime scoppé par user et retourne l\'id', async () => {
    prismaMock.deleteMany.mockResolvedValue({ count: 1 });

    const res = await deleteGearService(GEAR_ID, USER_ID);
    
    expect(prismaMock.deleteMany).toHaveBeenCalledWith({
    where: { id: GEAR_ID, user_id: USER_ID },
    });
    expect(res).toEqual({ id: GEAR_ID });
});
});