import { api } from './client.js';
import type { CreateGearDto, UpdateGearDto } from './validator/gear.js';

const createGear = async (gear: CreateGearDto) => {
    const response = await api.post('/gear', gear);
    return response.data;
};

const updateGear = async (gear: UpdateGearDto) => {
    const response = await api.put('/gear', gear);
    return response.data;
};

const getGear = async () => {
    const response = await api.get('/gear');
    return response.data;
};

const getGearById = async (id: string) => {
    const response = await api.get(`/gear/${id}`);
    return response.data;
};

const deleteGear = async (id: string) => {
    const response = await api.delete(`/gear/${id}`);
    return response.data;
};

export const gearApi = {
    createGear,
    updateGear,
    getGear,
    getGearById,
    deleteGear,
};