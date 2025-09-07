<template>
    <div class="dashboard-page">
        <h1 class="title container">Oclaris - Dashboard</h1>
        <div class="container banner-stats-wrapper">
            <div class="row banner-stats-item">
                <div class="stats-item-wrapper col col-xl-3 col-md-6 col-sm-3 col-xs-4" v-for="stat in bannerStats" :key="stat.title">
                    <div class="stat-item">
                        <h2 class="stat-title">{{ stat.title }}</h2>
                        <p class="stat-value">{{ stat.value }} {{ stat.type === 'percentage' ? '%' : '' }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="container second-stage-wrapper">
            <div class="row second-stage-item-wrapper">
                <div class="col col-xl-6 col-md-12 col-sm-6 col-xs-4 second-stage-item-wrapper-item diagram-item-wrapper">
                    <div class="second-stage-item diagram-item">
                        <BarChart :title="'Répartition des styles — 30 derniers jours'" :labels="labels" :values="values" :color="'#1b1f24'" :tickColor="'#f6e6e1'" />
                    </div>
                </div>
                <div class="col col-xl-6 col-md-12 col-sm-6 col-xs-4 second-stage-item-wrapper-item history-item-wrapper">
                    <div class="second-stage-item history-item">
                        <div class="da-wrapper" v-for="value in historyDA" :key="value.id">
                            <div class="imgs-wrapper">
                                <div class="img-item" v-for="image in value.images" :key="image">
                                    <img :src="`/assets/${image}`" alt="image">
                                </div>
                            </div>
                            <div class="da-item-style">
                                <p>Style - {{ value.style.join(', ') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container third-stage-wrapper">
            <div class="row">
                <div class="col col-xl-12 col-md-12 col-sm-6 col-xs-4 third-stage-item-wrapper-item">
                    <div class="third-stage-item">
                        <LineChart
                            :labels="['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']"
                            :seriesA="[12, 18, 15, 22, 24, 28, 20]"
                            :seriesB="[10, 14, 13, 19, 21, 25, 20]"
                            title="Activité — Générations & Favoris / jour (+ moyenne 7 j)"
                            :colorA="'#8f62f3'"
                            :colorB="'#cb93f1'"
                        />
                    </div>
                </div>
            </div>
        </div>
</div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import BarChart from '@/components/BarChart.vue';
import LineChart from '@/components/LineChart.vue';

const bannerStats = ref([
    {
        title: 'Taux de réussite - 30j',
        value: 86,
        type: 'percentage'
    },
    {
        title: 'Taux de satisfaction - 30j',
        value: 72,
        type: 'percentage'
    },
    {
        title: 'Nombre de favoris - 30j',
        value: 21,
        type: 'number'
    },
    {
        title: 'Nombre de générations - 30j',
        value: 32,
        type: 'number'
    },
]);

const historyDA = ref([
    {
        id: 1,
        style: ['Style 1', 'Style 2', 'Style 3'],
        images: ['image-1.JPG', 'image-2.JPG', 'image-3.JPG'],
    },
    {
        id: 2,
        style: ['Style 1', 'Style 2', 'Style 3'],
        images: ['image-1.JPG', 'image-2.JPG', 'image-3.JPG'],
    },
    {
        id: 3,
        style: ['Style 1', 'Style 2', 'Style 3'],
        images: ['image-1.JPG', 'image-2.JPG', 'image-3.JPG'],
    },
    {
        id: 4,
        style: ['Style 1', 'Style 2', 'Style 3'],
        images: ['image-1.JPG', 'image-2.JPG', 'image-3.JPG'],
    }
])

const labels = ['Urbain', 'Portrait', 'Action', 'Studio', 'Nature']
const values = [75, 98, 86, 42, 80]



</script>
<style scoped>

h1{
    margin-bottom: var(--spacing-l);
}
.banner-stats-wrapper{
    margin-bottom: calc(20 / 16 * 1rem);
}

.stats-item-wrapper .stat-item{
    background-color: var(--primary-grey);
    padding: var(--spacing-s);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    min-height: calc(110 / 16 * 1rem);
}

.stats-item-wrapper:nth-last-child(1) .stat-item{
    background-color: var(--primary-hover);
    color: var(--black-color);
}

.stats-item-wrapper:nth-child(1) .stat-item{
    background-color: var(--primary-color);
    color: var(--black-color);
}

.stats-item-wrapper .stat-title{
    font-size: var(--subtitle-2-font-size);
}

.stats-item-wrapper .stat-value{
    font-size: 2.5rem;
    font-weight: var(--font-weight-bold);
}

.second-stage-wrapper{
    margin-bottom: calc(20 / 16 * 1rem);
}

.second-stage-wrapper .diagram-item{
    background-color: var(--primary-grey);
    padding: var(--spacing-s);
    border-radius: var(--border-radius);
    min-height: calc(250 / 16 * 1rem);
    height: 100%;
}

.second-stage-wrapper .history-item-wrapper .history-item{
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    align-items: stretch;
    gap: calc(20 / 16 * 1rem);
    height: 100%;
}

.second-stage-wrapper .history-item-wrapper .history-item .da-wrapper{
    background-color: var(--primary-grey);
    padding: var(--spacing-s);
    border-radius: var(--border-radius);
    height: 100%;
    grid-column: span 3;
}

.second-stage-wrapper .history-item-wrapper .history-item .da-wrapper .imgs-wrapper{
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: calc(4 / 16 * 1rem);
    height: calc(80 / 16 * 1rem);
    margin-bottom: var(--spacing-s);
}

.second-stage-wrapper .history-item-wrapper .history-item .da-wrapper .imgs-wrapper .img-item{
    grid-column: span 2;
    height: 100%;
    border-radius: var(--border-radius);
    overflow: hidden;
}

.second-stage-wrapper .history-item-wrapper .history-item .da-wrapper .imgs-wrapper .img-item img{
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.second-stage-wrapper .history-item-wrapper .history-item .da-wrapper .da-item-style{
    background-color: var(--secondary-grey);
    padding: var(--spacing-m) var(--spacing-s);
    border-radius: var(--border-radius);
    display: flex;
    justify-content: center;
    align-items: center;
}

.second-stage-wrapper .history-item-wrapper .history-item .da-wrapper .da-item-style p{
    font-size: var(--small-font-size);
    color: var(--beige-color);
}

.third-stage-wrapper{
    margin-bottom: calc(20 / 16 * 1rem);
}

.third-stage-wrapper .third-stage-item{
    background-color: var(--primary-grey);
    padding: var(--spacing-s);
    border-radius: var(--border-radius);
    min-height: calc(250 / 16 * 1rem);
    height: 100%;
    width: 100%;
}



@media (max-width: 768px) {
    .stats-item-wrapper .stat-item{
        margin-bottom: calc(20 / 16 * 1rem);
    }
    .stats-item-wrapper:nth-last-child(1) .stat-item{
        margin-bottom: 0;
    }
    .stats-item-wrapper:nth-child(3) .stat-item{
        margin-bottom: 0;
    }
    .second-stage-wrapper .diagram-item-wrapper{
        margin-bottom: calc(20 / 16 * 1rem);
    }
}
@media (max-width: 481px) {
    .stats-item-wrapper .stat-item{
        margin-bottom: calc(10 / 16 * 1rem);
    }
    .second-stage-wrapper{
        margin-bottom: calc(10 / 16 * 1rem);
    }
    .second-stage-wrapper .history-item-wrapper .history-item{
        gap: calc(10 / 16 * 1rem);
    }
    .second-stage-wrapper .history-item-wrapper .history-item .da-wrapper{
        grid-column: span 6;
    }
    .second-stage-wrapper .diagram-item-wrapper{
        margin-bottom: calc(10 / 16 * 1rem);
    }
    .third-stage-wrapper{
        margin-bottom: calc(10 / 16 * 1rem);
    }
}

</style>