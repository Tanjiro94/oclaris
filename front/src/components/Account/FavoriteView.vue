<template>
    <div class="favorite-container">
        <div class="favorite-content">
            <h2>Mes favoris</h2>
        </div>
        <div class="favorite-header">
            <select name="sort" id="sort">
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
            </select>
            <select name="filter" id="filter">
                <option value="all">All</option>
                <option value="favorites">Favorites</option>
                <option value="not-favorites">Not Favorites</option>
            </select>
        </div>
        <div class="favorite-list">
            <div class="favorite-item" v-for="favorite in favorites" :key="favorite.id">
                <div class="favorite-item-content">
                    <div class="favorite-item-content-image">
                        <img :src="favorite.pictures[0]" alt="Favorite Image">
                    </div>
                    <div class="favorite-item-content-details">
                        <div class="favorite-item-content-details-styles">
                            <p>{{ favorite.styles[0] }}</p>
                        </div>
                    </div>
                    <div class="favorite-item-content-actions">
                        <div class="favorite-item-content-actions-like">
                            <i class="fa-solid fa-heart"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>

import {ref} from 'vue';

const favorites = ref([
    {
        id: '1',
        pictures: ['public/assets/image-1.JPG', 'public/assets/image-2.JPG', 'public/assets/image-3.JPG'],
        styles: ['Style 1', 'Style 2', 'Style 3'],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        pictures: ['public/assets/image-1.JPG', 'public/assets/image-2.JPG', 'public/assets/image-3.JPG'],
        styles: ['Style 1', 'Style 2', 'Style 3'],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '3',
        pictures: ['public/assets/image-1.JPG', 'public/assets/image-2.JPG', 'public/assets/image-3.JPG'],
        styles: ['Style 1', 'Style 2', 'Style 3'],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]);


</script>

<style scoped>

h2{
    margin-bottom: var(--spacing-m);
}

.favorite-header{
    background-color: var(--secondary-grey);
    padding: var(--spacing-s);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
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
    border-radius: 100px;
    padding: var(--spacing-s) var(--spacing-m);
    background:
    radial-gradient(circle at 20% 0%, rgba(255,255,255,0.25) 0, transparent 50%),
    linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2));
    color: var(--beige-color);
    backdrop-filter: blur(10px) saturate(160%);
    -webkit-backdrop-filter: blur(10px) saturate(160%);
    box-shadow:
    0 18px 35px rgba(0,0,0,0.7),
    0 0 0 1px rgba(255,255,255,0.05) inset;
    border: none;
    outline: none;
}
.favorite-item-content-details-styles::before{
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: inherit;
    background: linear-gradient(
        120deg,
        rgba(255,255,255,0.25),
        rgba(255,255,255,0) 25%
    );
    opacity: 0.7;
    pointer-events: none;
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
    border-radius: 100px;
    padding: var(--spacing-xs);
    background:
    radial-gradient(circle at 20% 0%, rgba(255,255,255,0.25) 0, transparent 50%),
    linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2));
    color: var(--beige-color);
    backdrop-filter: blur(10px) saturate(160%);
    -webkit-backdrop-filter: blur(10px) saturate(160%);
    box-shadow:
    0 18px 35px rgba(0,0,0,0.7),
    0 0 0 1px rgba(255,255,255,0.05) inset;
    border: none;
    outline: none;
}
.favorite-item-content-actions-like::before{
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: inherit;
    background: linear-gradient(
        120deg,
        rgba(255,255,255,0.25),
        rgba(255,255,255,0) 25%
    );
    opacity: 0.7;
    pointer-events: none;
}
.favorite-item-content-actions .favorite-item-content-actions-like i{
    color: red;
}
</style>