import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import {
    createDaController,
    listDaController,
    getDaByIdController,
    updateDaController,
    deleteDaController,
    toggleFavoriteDaController,
    listFavoriteDasController,
    addPlaceToDaController,
    removePlaceFromDaController,
    setDaStylesController,
    setDaConstraintsController,
    listGenerationJobsForDaController,
    listGenerationJobsForUserController,
    generateDaController,
    createImageGenerationJobForDaController,
    listStylesController,
    downloadDaImagesZipController,
} from '../modules/da/controllers/da.controller.js';

const router = Router();

router.get('/da/styles', requireAuth, listStylesController);

router.get('/da/favorites', requireAuth, listFavoriteDasController);
router.get('/da', requireAuth, listDaController);
router.get('/da/:id', requireAuth, getDaByIdController);
router.post('/da', requireAuth, createDaController);
router.patch('/da/:id', requireAuth, updateDaController);
router.delete('/da/:id', requireAuth, deleteDaController);

router.post('/da/:id/toggle-favorite', requireAuth, toggleFavoriteDaController);

router.post('/da/:id/places', requireAuth, addPlaceToDaController);
router.delete('/da/places/:placeId', requireAuth, removePlaceFromDaController);

router.post('/da/:id/styles', requireAuth, setDaStylesController);
router.post('/da/:id/constraints', requireAuth, setDaConstraintsController);

router.get(
    '/da/:id/generation-jobs',
    requireAuth,
    listGenerationJobsForDaController,
);
router.get('/generation-jobs', requireAuth, listGenerationJobsForUserController);

router.post('/da/:id/generate', requireAuth, generateDaController);
router.post(
    '/da/:id/generation-jobs',
    requireAuth,
    createImageGenerationJobForDaController,
);
router.get('/da/:id/images-zip', requireAuth, downloadDaImagesZipController);

export default router;
