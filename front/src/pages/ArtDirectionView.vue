<template>
    <div class="art-direction-view container">
        <h1 class="title">Créer une direction artistique</h1>

        <p v-if="errorMessage" class="error-message">
            {{ errorMessage }}
        </p>
    </div>

    <div class="art-direction-view-content container">
        <div class="art-direction-view-row row">
            <div
                class="art-direction-view-content-left-item col col-xl-6 col-md-12 col-sm-6 col-xs-6"
            >
                <div class="art-direction-view-item form-wrapper">
                    <div class="form-group brief-wrapper">
                        <UiTextarea
                            label="Brief - Prompt"
                            placeholder="Décris ton idée de direction artistique"
                            v-model="form.brief"
                            type-input="secondary"
                            name="brief"
                            id="brief"
                            className="form-textarea"
                            :fullWidth="true"
                        />
                    </div>

                    <div class="form-group tags-styles-wrapper">
                        <label>Styles</label>
                        <div class="tags-styles-list">
                            <span v-if="loadingStyles">Chargement des styles...</span>
                            <span v-else-if="styles.length === 0">
                                Aucun style disponible pour le moment.
                            </span>
                            <UiTag
                                v-else
                                v-for="styleItem in styles"
                                :key="styleItem.id"
                                :text="styleItem.name"
                                :type-class="
                                    isStyleSelected(styleItem.id)
                                        ? 'primary'
                                        : 'tertiary'
                                "
                                class="style-tag"
                                @click="toggleStyle(styleItem.id)"
                            />
                        </div>
                    </div>

                    <div class="form-group tags-styles-wrapper">
                        <UiTextarea
                            label="Contraintes créatives"
                            placeholder="Ex : seulement lumière naturelle, contre-jour, tons chauds..."
                            v-model="form.creativeConstraints"
                            type-input="secondary"
                            name="creativeConstraints"
                            id="creativeConstraints"
                            className="form-textarea"
                            :fullWidth="true"
                        />
                    </div>

                    <div class="form-group tags-styles-wrapper">
                        <template v-if="hasGear">
                            <UiToggle
                                label="Utiliser mon matériel"
                                v-model="form.useGear"
                            />
                        </template>
                        <template v-else>
                            <label>Matériel</label>
                            <p class="no-gear-text">
                                Tu n'as pas encore ajouté de matériel à ton compte.
                            </p>
                            <button
                                type="button"
                                class="add-gear-link"
                                @click="goToGearPage"
                            >
                                Ajouter mon matériel
                                <i class="fa-solid fa-arrow-up-right-from-square" />
                            </button>
                        </template>
                    </div>

                    <div class="form-group btn-wrapper">
                        <UiButton
                            typeClass="primary"
                            text="Lancer la génération"
                            :loading="loading"
                            :disabled="loading || !form.brief.trim()"
                            @click="onGenerateClick"
                        />
                        <UiButton
                            typeClass="tertiary"
                            text="Réinitialiser"
                            :disabled="loading"
                            @click="onResetClick"
                        />
                    </div>
                </div>
            </div>

            <div
                class="art-direction-view-content-right-item col col-xl-6 col-md-12 col-sm-6 col-xs-6"
                v-if="imagesGenerated.length > 0"
            >
                <div class="art-direction-view-item images-wrapper">
                    <div class="images-header">
                        <h2>Images générées</h2>
                        <div class="images-actions">
                            <button
                                class="icon-btn favorite-btn"
                                type="button"
                                :disabled="!currentDaId || toggleFavoriteLoading"
                                @click="onToggleFavoriteClick"
                                :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                            >
                                <i
                                    :class="[
                                        isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart',
                                        toggleFavoriteLoading ? 'icon-loading' : ''
                                    ]"
                                />
                            </button>

                            <button
                                class="icon-btn download-btn"
                                type="button"
                                :disabled="downloadLoading || imagesGenerated.length === 0"
                                @click="onDownloadImagesClick"
                                title="Télécharger toutes les images"
                            >
                                <i
                                    :class="[
                                        'fa-solid',
                                        downloadLoading ? 'fa-spinner icon-loading' : 'fa-download'
                                    ]"
                                />
                            </button>
                        </div>
                    </div>

                    <div class="images-list">
                        <div
                            class="image-item"
                            v-for="image in imagesGenerated"
                            :key="image.id"
                        >
                            <div class="regenerate-icon">
                                <UiTag
                                    typeClass="tertiary"
                                    :no-text="true"
                                    icon="fa-solid fa-rotate-right"
                                />
                            </div>
                            <img :src="image.url" alt="Image générée" />
                        </div>
                    </div>

                    <div
                        class="stats-wrapper"
                        v-if="generationStats"
                    >
                        <p>Temps : {{ generationStats.duration.toFixed(1) }}s</p>
                        <p>Images : {{ generationStats.count }}</p>
                        <p>Modèle : {{ generationStats.model }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div
        class="art-direction-view-footer container"
        v-if="technicalAdvice && placesSuggestions.length > 0"
    >
        <div class="footer-row row">
            <div class="footer-row-item left-item col col-xl-6 col-md-6 col-sm-6 col-xs-6">
                <div class="footer-item-content">
                    <h3>Conseils techniques</h3>
                    <p class="technical-text">
                        {{ technicalAdvice }}
                    </p>
                </div>
            </div>
            <div class="footer-row-item right-item col col-xl-6 col-md-6 col-sm-6 col-xs-6">
                <div class="footer-item-content">
                    <h3>Suggestions de lieux</h3>
                    <ul class="places-list">
                        <li
                            v-for="place in placesSuggestions"
                            :key="place"
                        >
                            {{ place }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <UiOverlayLoader
        :visible="loading"
        text="Analyse du brief et préparation de ta direction artistique..."
    />
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

import UiTextarea from '@/components/UiTextarea.vue';
import UiTag from '@/components/UiTag.vue';
import UiToggle from '@/components/UiToggle.vue';
import UiButton from '@/components/UiButton.vue';
import UiOverlayLoader from '@/components/UiOverlayLoader.vue';

import { daApi } from '@/ts/api/da';
import { gearApi } from '@/ts/api/gear';

import type {
    GeneratedPictureDto,
    StyleDto,
} from '@/ts/api/validator/da';

const router = useRouter();

const STORAGE_KEY = 'oclaris_da_creation_state';

type PersistedDaState = {
    currentDaId: string | null;
    form: {
        brief: string;
        creativeConstraints: string;
        styles: string[];
        useGear: boolean;
    };
    imagesGenerated: GeneratedPictureDto[];
    technicalAdvice: string;
    placesSuggestions: string[];
    generationStats: {
        duration: number;
        count: number;
        model: string;
    } | null;
    isFavorite: boolean;
};

const styles = ref<StyleDto[]>([]);
const loadingStyles = ref(false);

const hasGear = ref(false);

const form = ref<{
    brief: string;
    creativeConstraints: string;
    styles: string[];
    useGear: boolean;
}>({
    brief: '',
    creativeConstraints: '',
    styles: [],
    useGear: false,
});

const currentDaId = ref<string | null>(null);

const imagesGenerated = ref<GeneratedPictureDto[]>([]);
const technicalAdvice = ref<string>('');
const placesSuggestions = ref<string[]>([]);

const generationStats = ref<{
    duration: number;
    count: number;
    model: string;
} | null>(null);

const loading = ref(false);
const errorMessage = ref<string | null>(null);

const isFavorite = ref(false);
const toggleFavoriteLoading = ref(false);
const downloadLoading = ref(false);

const selectedStyleNames = computed(() =>
    styles.value
        .filter((s) => form.value.styles.includes(s.id))
        .map((s) => s.name),
);

function persistState() {
    if (typeof window === 'undefined') return;

    const state: PersistedDaState = {
        currentDaId: currentDaId.value,
        form: {
            brief: form.value.brief,
            creativeConstraints: form.value.creativeConstraints,
            styles: form.value.styles,
            useGear: form.value.useGear,
        },
        imagesGenerated: imagesGenerated.value,
        technicalAdvice: technicalAdvice.value,
        placesSuggestions: placesSuggestions.value,
        generationStats: generationStats.value,
        isFavorite: isFavorite.value,
    };

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('[DA] impossible de persister la state', e);
    }
}

function restoreStateFromStorage() {
    if (typeof window === 'undefined') return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
        const parsed = JSON.parse(raw) as PersistedDaState;

        currentDaId.value = parsed.currentDaId;

        form.value = {
            brief: parsed.form?.brief ?? '',
            creativeConstraints: parsed.form?.creativeConstraints ?? '',
            styles: parsed.form?.styles ?? [],
            useGear: parsed.form?.useGear ?? false,
        };

        imagesGenerated.value = parsed.imagesGenerated ?? [];
        technicalAdvice.value = parsed.technicalAdvice ?? '';
        placesSuggestions.value = parsed.placesSuggestions ?? [];
        generationStats.value = parsed.generationStats ?? null;
        isFavorite.value = parsed.isFavorite ?? false;
    } catch (e) {
        console.warn('[DA] impossible de restaurer la state', e);
    }
}

function clearPersistedState() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.warn('[DA] impossible de clear la state', e);
    }
}

async function loadStyles() {
    try {
        loadingStyles.value = true;
        const data = await daApi.getStyleList();
        styles.value = data;
    } catch (err) {
        console.error('[DA] getStyleList error', err);
        errorMessage.value =
            "Impossible de charger les styles pour le moment.";
    } finally {
        loadingStyles.value = false;
    }
}

async function checkHasGear() {
    try {
        const result = await gearApi.getGear();
        hasGear.value = (result.items?.length ?? 0) > 0;

        if (!hasGear.value) {
            form.value.useGear = false;
        }
    } catch (err) {
        console.error('[DA] getGearList error', err);
        hasGear.value = false;
        form.value.useGear = false;
    }
}

function goToGearPage() {
    router.push('/account');
}

onMounted(async () => {
    restoreStateFromStorage();
    await Promise.all([
        loadStyles(),
        checkHasGear(),
    ]);
});

function isStyleSelected(id: string): boolean {
    return form.value.styles.includes(id);
}

function toggleStyle(id: string) {
    const idx = form.value.styles.indexOf(id);
    if (idx === -1) {
        form.value.styles.push(id);
    } else {
        form.value.styles.splice(idx, 1);
    }
    persistState();
}

function buildTitleFromBrief(brief: string): string {
    const trimmed = brief.trim();
    if (!trimmed) return 'Nouvelle direction artistique';

    const slice = trimmed.slice(0, 60);
    return slice.length < trimmed.length ? `${slice}…` : slice;
}

async function onGenerateClick() {
    if (!form.value.brief.trim()) {
        errorMessage.value = 'Le brief est obligatoire pour générer une DA.';
        return;
    }

    loading.value = true;
    errorMessage.value = null;
    imagesGenerated.value = [];
    technicalAdvice.value = '';
    placesSuggestions.value = [];
    generationStats.value = null;
    isFavorite.value = false;

    try {
        // 1. Créer ou mettre à jour la DA
        if (!currentDaId.value) {
            const payload = {
                title: buildTitleFromBrief(form.value.brief),
                brief: form.value.brief,
                use_gear: form.value.useGear,
                status: 'draft' as const,
            };

            const createdDa: { id: string } = await daApi.createDa(payload);
            currentDaId.value = createdDa.id;
            isFavorite.value = false;
        } else {
            const updatePayload: { brief?: string; use_gear?: boolean } = {
                brief: form.value.brief,
                use_gear: form.value.useGear,
            };
            await daApi.updateDa(currentDaId.value, updatePayload);
        }

        if (!currentDaId.value) {
            throw new Error("Impossible de récupérer l'id de la direction artistique.");
        }

        // 2. Styles
        await daApi.setDaStyles(currentDaId.value, {
            art_direction_id: currentDaId.value,
            style_ids: form.value.styles,
        });

        // 3. Contraintes créatives (stockées en BDD si non vides)
        const trimmedConstraints = form.value.creativeConstraints.trim();
        if (trimmedConstraints) {
            await daApi.setDaConstraints(currentDaId.value, {
                art_direction_id: currentDaId.value,
                constraints: trimmedConstraints,
            });
        }

        // 4. Génération des images
        const startedAt = performance.now();

        const result = await daApi.generateDa(currentDaId.value, {
            count: 3,
            model: 'llama3',
            creative_constraints: form.value.creativeConstraints || undefined,
            styles: selectedStyleNames.value,
        });

        const durationSec = (performance.now() - startedAt) / 1000;

        imagesGenerated.value = result.pictures;
        technicalAdvice.value = result.technicalAdvice;
        placesSuggestions.value = result.locationSuggestions;

        generationStats.value = {
            duration: durationSec,
            count: result.pictures.length,
            model: result.job.model,
        };

        persistState();
    } catch (err) {
        console.error('[DA-GENERATE] error', err);
        if (err instanceof Error) {
            errorMessage.value = err.message;
        } else {
            errorMessage.value =
                'Une erreur est survenue lors de la génération.';
        }
    } finally {
        loading.value = false;
    }
}

function onResetClick() {
    form.value = {
        brief: '',
        creativeConstraints: '',
        styles: [],
        useGear: false,
    };
    imagesGenerated.value = [];
    technicalAdvice.value = '';
    placesSuggestions.value = [];
    generationStats.value = null;
    currentDaId.value = null;
    isFavorite.value = false;
    errorMessage.value = null;

    clearPersistedState();
}

async function onToggleFavoriteClick() {
    if (!currentDaId.value) {
        errorMessage.value =
            "Tu dois d'abord générer / sauvegarder la DA avant de la mettre en favoris.";
        return;
    }

    toggleFavoriteLoading.value = true;

    try {
        const result = await daApi.toggleDaFavorite(currentDaId.value);
        isFavorite.value = result.isFavorite;
        persistState();
    } catch (err) {
        console.error('[DA-FAVORITE] error', err);
        errorMessage.value =
            "Impossible de mettre à jour le favori pour le moment.";
    } finally {
        toggleFavoriteLoading.value = false;
    }
}

async function onDownloadImagesClick() {
    if (!currentDaId.value || imagesGenerated.value.length === 0) return;

    downloadLoading.value = true;
    errorMessage.value = null;

    try {
        const blob = await daApi.downloadDaImagesZip(currentDaId.value);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'art-direction-images.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('[DA-DOWNLOAD] error', err);
        errorMessage.value =
            "Impossible de télécharger les images pour le moment.";
    } finally {
        downloadLoading.value = false;
    }
}
</script>

<style scoped>
/* ton CSS existant, inchangé */
h1 {
    margin-bottom: var(--spacing-l);
}

.error-message {
    color: var(--danger-color, #ff4d4f);
    margin-top: var(--spacing-xs);
}

.art-direction-view-content {
    margin-bottom: var(--spacing-l);
}
.art-direction-view-content-left-item .form-wrapper,
.art-direction-view-content-right-item .images-wrapper {
    background-color: var(--primary-grey);
    padding: var(--spacing-m);
    border-radius: var(--border-radius);
    height: 100%;
}

.art-direction-view-item .form-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
}

.form-group.brief-wrapper {
    margin-bottom: var(--spacing-m);
}

.form-group.tags-styles-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    flex-wrap: wrap;
    margin-bottom: var(--spacing-m);
}
.form-group.tags-styles-wrapper .tags-styles-list {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-s);
    flex-wrap: wrap;
}

.style-tag {
    cursor: pointer;
}

.no-gear-text {
    font-size: 0.875rem;
    opacity: 0.9;
}

.add-gear-link {
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--accent-color, #ff4d4f);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    text-decoration: underline;
}

.images-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-m);
}

.images-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.icon-btn {
    border: none;
    background: var(--secondary-grey);
    padding: 0.4rem 0.6rem;
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.icon-btn i {
    font-size: 0.9rem;
}

.icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.favorite-btn i {
    color: var(--accent-color, #ff4d4f);
}

.download-btn i {
    color: var(--beige-color);
}

.icon-loading {
    animation: spin 0.8s linear infinite;
}

.form-group.btn-wrapper {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-s);
    flex-wrap: wrap;
}

.art-direction-view-footer {
    margin-bottom: var(--spacing-l);
}

.art-direction-view-footer
    .footer-row
    .left-item
    .footer-item-content,
.art-direction-view-footer
    .footer-row
    .right-item
    .footer-item-content {
    background-color: var(--primary-grey);
    padding: var(--spacing-m);
    border-radius: var(--border-radius);
}

.art-direction-view-footer .technical-text {
    white-space: pre-line;
}

.places-list {
    list-style: disc;
    padding-left: 1.5rem;
}

.art-direction-view-content-right-item .images-wrapper h2 {
    margin: 0;
}
.art-direction-view-content-right-item .images-wrapper .images-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-s);
    margin-bottom: var(--spacing-m);
}
.art-direction-view-content-right-item .images-wrapper .images-list .image-item {
    grid-column: span 1;
    height: calc(250 / 16 * 1rem);
    position: relative;
}
.art-direction-view-content-right-item
    .images-wrapper
    .images-list
    .image-item
    img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--border-radius);
}

.art-direction-view-content-right-item
    .images-wrapper
    .images-list
    .image-item
    .regenerate-icon {
    position: absolute;
    top: var(--spacing-s);
    right: var(--spacing-s);
    z-index: 1;
    display: none;
}

.art-direction-view-content-right-item .stats-wrapper {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-s);
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-m) var(--spacing-s);
    border-radius: var(--border-radius);
    background-color: var(--secondary-grey);
}

@media (max-width: 1024px) {
    .art-direction-view-content-right-item .images-wrapper .images-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-s);
    }
}

@media (max-width: 768px) {
    .art-direction-view-content-right-item .images-wrapper .images-list {
        grid-template-columns: repeat(2, 1fr);
    }
    .art-direction-view-content-right-item .images-wrapper .images-list .image-item {
        height: calc(300 / 16 * 1rem);
        grid-column: span 1;
    }
    .art-direction-view-content .art-direction-view-content-left-item {
        margin-bottom: var(--spacing-l);
    }
}

@media (max-width: 481px) {
    .art-direction-view-content-right-item .images-wrapper .images-list .image-item {
        height: calc(200 / 16 * 1rem);
    }
}

@media (max-width: 330px) {
    .art-direction-view-content-right-item .images-wrapper .images-list {
        grid-template-columns: repeat(1, 1fr);
    }
    .art-direction-view-content-right-item .images-wrapper .images-list .image-item {
        height: calc(300 / 16 * 1rem);
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
