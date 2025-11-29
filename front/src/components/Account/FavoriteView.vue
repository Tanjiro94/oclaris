<template>
    <div class="favorite-container">
        <div class="favorite-content">
            <h2>Mes favoris</h2>
        </div>

        <UiHeadAction className="favorite-header">
            <template #left-content>
                <select
                    name="sort"
                    id="sort"
                    v-model="sortOrder"
                    :disabled="favorites.length === 0"
                >
                    <option value="latest">Récent</option>
                    <option value="oldest">Ancien</option>
                </select>
            </template>

            <template #right-content>
                <p>Total ({{ displayedFavorites.length }})</p>
            </template>
        </UiHeadAction>

        <div class="favorite-list" v-if="displayedFavorites.length > 0">
            <RouterLink
                v-for="favorite in displayedFavorites"
                :key="favorite.id"
                :to="`/favorite/${favorite.id}`"
            >
                <div class="favorite-item">
                    <div class="favorite-item-content">
                        <div class="favorite-item-content-image">
                            <img
                                :src="favorite.pictures[0]"
                                alt="Favorite Image"
                            >
                        </div>

                        <div class="favorite-item-content-details">
                            <div class="favorite-item-content-details-styles">
                                <UiTag
                                    v-if="favorite.styles[0]"
                                    :text="favorite.styles[0]"
                                    typeClass="tertiary"
                                />
                            </div>
                        </div>

                        <div class="favorite-item-content-actions">
                            <div class="favorite-item-content-actions-like">
                                <UiTag
                                    :noText="true"
                                    typeClass="tertiary"
                                    icon="fa-solid fa-heart"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </RouterLink>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import UiTag from '@/components/UiTag.vue';
import UiHeadAction from '@/components/UiHeadAction.vue';
import { daApi } from '@/ts/api/da';
import type { DaListItemDto, GetDaListResponseDto } from '@/ts/api/validator/da';

const favorites = ref<DaListItemDto[]>([]);

const sortOrder = ref<'latest' | 'oldest'>('latest');
/* const filterMode = ref<'all' | 'favorites' | 'not-favorites'>('all'); */

const displayedFavorites = computed(() => {
    const list = [...favorites.value];

    /* if (filterMode.value === 'favorites') {
        list = list.filter((da) => da.isFavorite === true);
    } else if (filterMode.value === 'not-favorites') {
        list = list.filter((da) => da.isFavorite === false || da.isFavorite == null);
    } */

    list.sort((a, b) => {
        const ta = new Date(a.created_at as string | Date).getTime();
        const tb = new Date(b.created_at as string | Date).getTime();

        if (sortOrder.value === 'latest') {
            return tb - ta;
        } else {
            return ta - tb; 
        }
    });

    return list;
});

const getFavorites = async () => {
    const response: GetDaListResponseDto = await daApi.getDaFavorites();
    favorites.value = response.data;
};

onMounted(() => {
    getFavorites();
});
</script>


<style scoped>

h2{
    margin-bottom: var(--spacing-m);
}

.favorite-header select{
    border: none;
    outline: none;
    background-color: var(--primary-grey);
    color: var(--beige-color);
    padding: var(--spacing-s) var(--spacing-m);
    border-radius: 100px;
    font-size: var(--small-font-size);
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
}

.favorite-list{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-m);
}

.favorite-item{
    grid-column: span 1;
    background-color: var(--secondary-grey);
    padding: var(--spacing-s);
    border-radius: var(--border-radius);
    cursor: pointer;
}

.favorite-item-content{
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);
    position: relative;
}

.favorite-item-content-image{
    width: 100%;
    height: calc(350 / 16 * 1rem);
    border-radius: var(--border-radius);
    overflow: hidden;
}

.favorite-item-content-image img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--border-radius);
}

.favorite-item-content-details{
    position: absolute;
    bottom: 20px;
    left: 10px;
}

.favorite-item-content-details-styles{
    position: relative;
}

.favorite-item-content-details .favorite-item-content-details-styles p{
    font-size: var(--small-font-size);
    color: var(--beige-color);
}

.favorite-item-content-actions{
    position: absolute;
    top: 10px;
    right: 10px;
}

.favorite-item-content-actions .favorite-item-content-actions-like {
    position: relative;
}
.favorite-item-content-actions .favorite-item-content-actions-like i{
    color: red;
}

@media (max-width: 992px) {
    .favorite-list{
        grid-template-columns: repeat(2, 1fr);
    }
    .favorite-item{
        grid-column: span 1;
    }
    .favorite-item-content-image{
        height: calc(250 / 16 * 1rem);
    }
}

@media (max-width: 768px) {
    .favorite-item-content-image{
        height: calc(200 / 16 * 1rem);
    }
}
@media (max-width: 576px) {
    .favorite-list{
        grid-template-columns: repeat(1, 1fr);
    }
    .favorite-item{
        grid-column: span 1;
    }
    .favorite-item-content-image{
        height: calc(150 / 16 * 1rem);
    }
}
</style>