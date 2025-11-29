import { api } from './client.js';
import type {
    CreateDaDto,
    UpdateDaDto,
    GetDaListQueryDto,
    GetDaListResponseDto,
    DaDetailDto,
    AddPlaceDto,
    SetDaStylesDto,
    SetDaConstraintsDto,
    ListGenerationJobsResponseDto,
    ListGenerationJobsQueryDto,
    ToggleFavoriteResponseDto,
} from './validator/da.js';

const getDaList = async (params?: GetDaListQueryDto) => {
    const response = await api.get<GetDaListResponseDto>('/da', {
        params,
    });
    return response.data;
};

const getDaFavorites = async () => {
    const response = await api.get<GetDaListResponseDto>('/da/favorites');
    return response.data;
};

const getDaById = async (id: string) => {
    const response = await api.get<DaDetailDto>(`/da/${id}`);
    return response.data;
};

const createDa = async (payload: CreateDaDto) => {
    const response = await api.post('/da', payload);
    return response.data;
};

const updateDa = async (id: string, payload: UpdateDaDto) => {
    const response = await api.patch(`/da/${id}`, payload);
    return response.data;
};

const deleteDa = async (id: string) => {
    const response = await api.delete(`/da/${id}`);
    return response.data as { success: boolean };
};

const toggleDaFavorite = async (id: string) => {
    const response = await api.post<ToggleFavoriteResponseDto>(
        `/da/${id}/toggle-favorite`,
    );
    return response.data;
};

const addPlaceToDa = async (daId: string, payload: AddPlaceDto) => {
    const response = await api.post(`/da/${daId}/places`, payload);
    return response.data;
};

const removePlaceFromDa = async (placeId: string) => {
    const response = await api.delete(`/da/places/${placeId}`);
    return response.data as { success: boolean };
};

const setDaStyles = async (daId: string, payload: SetDaStylesDto) => {
    const response = await api.post<{ success: boolean }>(
        `/da/${daId}/styles`,
        payload,
    );
    return response.data;
};

const setDaConstraints = async (
    daId: string,
    payload: SetDaConstraintsDto,
) => {
    const response = await api.post<{ success: boolean }>(
        `/da/${daId}/constraints`,
        payload,
    );
    return response.data;
};

const getGenerationJobsForDa = async (daId: string) => {
    const response = await api.get<ListGenerationJobsResponseDto>(
        `/da/${daId}/generation-jobs`,
    );
    return response.data;
};

const getGenerationJobsForUser = async (
    params?: ListGenerationJobsQueryDto,
) => {
    const response = await api.get<ListGenerationJobsResponseDto>(
        '/generation-jobs',
        {
            params,
        },
    );
    return response.data;
};

export const daApi = {
    // CRUD DA
    getDaList,
    getDaFavorites,
    getDaById,
    createDa,
    updateDa,
    deleteDa,

    // Favoris
    toggleDaFavorite,

    // Places
    addPlaceToDa,
    removePlaceFromDa,

    // Styles & contraintes
    setDaStyles,
    setDaConstraints,

    // Jobs
    getGenerationJobsForDa,
    getGenerationJobsForUser,
};
