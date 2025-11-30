<template>
    <div class="art-direction-view container">
        <h1 class="title">{{ title }}</h1>

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
                            :disabled="true"
                        />
                    </div>

                    <div class="form-group tags-styles-wrapper">
                        <label>Styles</label>
                        <div class="tags-styles-list">
                            <span v-if="selectedStyleNames.length === 0">
                                Aucun style renseigné pour cette direction artistique.
                            </span>
                            <UiTag
                                v-else
                                v-for="styleName in selectedStyleNames"
                                :key="styleName"
                                :text="styleName"
                                type-class="primary"
                                class="style-tag"
                                :disabled="true"
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
                            :disabled="true"
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
                                ></i>
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
                                ></i>
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
import { useRoute } from 'vue-router';

import UiTextarea from '@/components/UiTextarea.vue';
import UiTag from '@/components/UiTag.vue';
import UiOverlayLoader from '@/components/UiOverlayLoader.vue';

import { daApi } from '@/ts/api/da';

import type {
    GeneratedPictureDto,
    StyleDto,
    DaDetailDto,
    ListGenerationJobsResponseDto,
} from '@/ts/api/validator/da';

const route = useRoute();

/**
 * --- TYPES LOCAUX ---
 */

// Ce qui est stocké dans generation_job.params quand on génère une DA
type GenerationJobParams = {
    count?: number;
    model?: string;
    creative_constraints?: string | null;
    styles?: string[];
    technicalAdvice?: string;
    locationSuggestions?: string[];
    improvedPrompt?: string;

    // autres cas possibles (enqueue, etc.)
    images_count?: number;
    prompt?: string;
    use_gear?: boolean;
    gear?: { type: string; brand: string; model: string }[];
};

// On étend le DTO "officiel" avec les relations renvoyées par le back
type DaDetailWithRelations = DaDetailDto & {
    ad_style?: {
        style?: { id: string } | null;
        style_id?: string | null;
    }[];
    ad_constraint?: {
        constraint_option?: {
            label?: string | null;
            libelle?: string | null;
            name?: string | null;
        } | null;
    }[];
    ad_place?: {
        name?: string | null;
        address?: string | null;
    }[];
    picture_generated?: { id: string; url: string }[];
    pictures?: ({ id: string; url: string } | string)[];
    favorite?: unknown[];
};

/**
 * --- STATE GLOBALE ---
 */
const loading = ref(true);
const errorMessage = ref<string | null>(null);

const styles = ref<StyleDto[]>([]);
const loadingStyles = ref(false);

const form = ref<{
    brief: string;
    creativeConstraints: string;
    styles: string[];   // IDs de styles
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

const isFavorite = ref(false);
const toggleFavoriteLoading = ref(false);
const downloadLoading = ref(false);

/**
 * --- HELPERS ---
 */

// Tous les styles possibles (tags) viennent de /da/styles
async function loadStyles() {
    try {
        loadingStyles.value = true;
        const data = await daApi.getStyleList();
        styles.value = data;
    } catch (err) {
        console.error('[DA-DETAIL] getStyleList error', err);
        // au pire, pas de styles
    } finally {
        loadingStyles.value = false;
    }
}

// Styles sélectionnés pour CETTE DA, sous forme de noms
const selectedStyleNames = computed(() =>
    styles.value
        .filter((s) => form.value.styles.includes(s.id))
        .map((s) => s.name),
);

/**
 * --- CHARGEMENT DE LA DA ---
 */
onMounted(async () => {
    const rawId = route.params.id;
    const id =
        typeof rawId === 'string'
            ? rawId
            : Array.isArray(rawId)
            ? rawId[0]
            : undefined;

    if (!id) {
        errorMessage.value = 'Direction artistique introuvable.';
        loading.value = false;
        return;
    }

    try {
        loading.value = true;
        errorMessage.value = null;

        // 1) Styles globaux
        await loadStyles();

        // 2) Détail de la DA (avec les relations)
        const daDetail = (await daApi.getDaById(id)) as DaDetailWithRelations;

        // 3) Jobs de génération (optionnel)
        let jobsRes: ListGenerationJobsResponseDto | null = null;
        try {
            jobsRes = await daApi.getGenerationJobsForDa(id);
        } catch (err) {
            console.error('[DA-DETAIL] getGenerationJobsForDa error', err);
            jobsRes = null;
        }

        const data = daDetail;
        currentDaId.value = data.id;

        // --- BRIEF --- //
        form.value.brief = data.brief ?? '';

        // --- STYLES DE CETTE DA --- //
        form.value.styles = Array.isArray(data.ad_style)
            ? data.ad_style
                  .map((rel) => rel.style?.id ?? rel.style_id)
                  .filter((styleId): styleId is string => Boolean(styleId))
            : [];

        // --- IMAGES GÉNÉRÉES --- //
        const rawPictures: ({ id: string; url: string } | string)[] =
            (data.picture_generated as { id: string; url: string }[] | undefined) ??
            (data.pictures as ({ id: string; url: string } | string)[] | undefined) ??
            [];

        imagesGenerated.value = rawPictures.map((p, index) =>
            typeof p === 'string'
                ? { id: `${data.id}-${index}`, url: p }
                : { id: p.id ?? `${data.id}-${index}`, url: p.url },
        );

        // --- FAVORI --- //
        isFavorite.value =
            (data as DaDetailWithRelations & { isFavorite?: boolean }).isFavorite ??
            (Array.isArray(data.favorite) && data.favorite.length > 0);

        // --- JOBS DE GÉNÉRATION --- //
        const jobs = jobsRes?.data ?? [];
        const lastJob = jobs.length > 0 ? jobs[0] : null;

        // --- CONTRAINTES & CONSEILS & LIEUX --- //
        let constraintsText = '';
        let aiTechnicalAdvice = '';
        let aiLocationSuggestions: string[] = [];

        if (lastJob && lastJob.params) {
            const params = lastJob.params as GenerationJobParams;

            if (params.creative_constraints) {
                constraintsText = params.creative_constraints;
            }

            if (typeof params.technicalAdvice === 'string') {
                aiTechnicalAdvice = params.technicalAdvice;
            }

            if (Array.isArray(params.locationSuggestions)) {
                aiLocationSuggestions = params.locationSuggestions.filter(Boolean);
            }
        }

        // 2. Si pas de contraintes texte, on essaye de dériver depuis les contraintes liées (ad_constraint)
        if (!constraintsText && Array.isArray(data.ad_constraint)) {
            const constraintLabels = data.ad_constraint
                .map((c) =>
                    c.constraint_option?.label ??
                    c.constraint_option?.libelle ??
                    c.constraint_option?.name,
                )
                .filter((label): label is string => Boolean(label));

            if (constraintLabels.length > 0) {
                constraintsText = constraintLabels.join(', ');
            }
        }

        form.value.creativeConstraints = constraintsText;

        // 3. Lieux enregistrés côté BDD (fallback)
        const savedPlaces = Array.isArray(data.ad_place)
            ? data.ad_place
                  .map((p) => p.name || p.address)
                  .filter((val): val is string => Boolean(val))
            : [];

        // 4. Lieux : priorité aux suggestions IA, sinon lieux sauvegardés
        placesSuggestions.value =
            aiLocationSuggestions.length > 0 ? aiLocationSuggestions : savedPlaces;

        // 5. Conseils techniques IA
        technicalAdvice.value = aiTechnicalAdvice;

        // --- STATS --- //
        if (lastJob && lastJob.duration != null && lastJob.model) {
            generationStats.value = {
                duration: lastJob.duration,
                count: imagesGenerated.value.length,
                model: lastJob.model,
            };
        } else {
            generationStats.value = null;
        }
    } catch (err) {
        console.error('[DA-DETAIL] error', err);
        errorMessage.value =
            'Impossible de charger cette direction artistique.';
    } finally {
        loading.value = false;
    }
});

/**
 * --- ACTIONS ---
 */
async function onToggleFavoriteClick() {
    if (!currentDaId.value) return;

    toggleFavoriteLoading.value = true;
    errorMessage.value = null;

    try {
        const result = await daApi.toggleDaFavorite(currentDaId.value);
        isFavorite.value = result.isFavorite;
    } catch (err) {
        console.error('[DA-DETAIL-FAVORITE] error', err);
        errorMessage.value =
            'Impossible de mettre à jour le favori pour le moment.';
    } finally {
        toggleFavoriteLoading.value = false;
    }
}

const title = computed(() => {
    const text = form.value.brief || 'Direction artistique';
    return text.length > 40 ? text.slice(0, 40) + '…' : text;
});

async function onDownloadImagesClick() {
    if (!currentDaId.value || imagesGenerated.value.length === 0) return;

    downloadLoading.value = true;
    errorMessage.value = null;

    try {
        const blob = await daApi.downloadDaImagesZip(currentDaId.value);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `art-direction-${currentDaId.value}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('[DA-DETAIL-DOWNLOAD] error', err);
        errorMessage.value =
            'Impossible de télécharger les images pour le moment.';
    } finally {
        downloadLoading.value = false;
    }
}
</script>


<style scoped>
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

/* .art-direction-view-content
    .art-direction-view-content-left-item,
.art-direction-view-content
    .art-direction-view-content-right-item {
    height: 100%;
} */

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
