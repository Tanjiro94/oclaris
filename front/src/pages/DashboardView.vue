<template>
    <div class="dashboard-page">
        <h1 class="title container">Oclaris - Dashboard</h1>
        <div class="container banner-stats-wrapper">
            <div class="row banner-stats-item">
                <div class="stats-item-wrapper col col-xl-3 col-md-6 col-sm-3 col-xs-4" v-for="stat in bannerStats" :key="stat?.title">
                    <div class="stat-item">
                        <h2 class="stat-title">{{ stat?.title }}</h2>
                        <p class="stat-value">{{ stat?.value }} {{ stat?.type === 'percentage' ? '%' : '' }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="container second-stage-wrapper">
            <div class="row second-stage-item-wrapper">
                <div class="col col-xl-6 col-md-12 col-sm-6 col-xs-4 second-stage-item-wrapper-item diagram-item-wrapper">
                    <div class="second-stage-item diagram-item">
                        <BarChart :title="'Répartition des styles — 30 derniers jours'" :labels="labelsStyles" :values="valuesStyles" :color="'#1b1f24'" :tickColor="'#f6e6e1'" />
                    </div>
                </div>
                <div class="col col-xl-6 col-md-12 col-sm-6 col-xs-4 second-stage-item-wrapper-item history-item-wrapper" v-if="historyDA.length > 0">
                    <div class="second-stage-item history-item" :class="historyGridClass">
                        <div class="da-wrapper" v-for="value in historyDA" :key="value.id" @click="router.push(`/art-directions/${value.id}`)">
                            <div class="imgs-wrapper">
                                <div class="img-item" v-for="image in value.pictures" :key="image">
                                    <img :src="image" alt="image">
                                </div>
                            </div>
                            <div class="da-item-style">
                                <p>Style - {{ value.styles[0] + (value.styles.length > 1 ? ' + ' + (value.styles.length - 1) : '') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="second-stage-item history-item-wrapper-void col col-xl-6 col-md-12 col-sm-6 col-xs-4" v-else>
                    <RouterLink to="/create-da">
                        <UiButton text="Créer un DA" typeClass="primary" size="lg"/>
                    </RouterLink>
                </div>
            </div>
        </div>

        <div class="container third-stage-wrapper">
            <div class="row">
                <div class="col col-xl-12 col-md-12 col-sm-6 col-xs-4 third-stage-item-wrapper-item">
                    <div class="third-stage-item">
                        <LineChart
                            :labels="labelsActivity"
                            :seriesA="seriesA"
                            :seriesB="seriesB"
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
import { onMounted, ref, computed } from 'vue';
import BarChart from '@/components/BarChart.vue';
import LineChart from '@/components/LineChart.vue';
import { getDashboard } from '@/ts/api/dashboard';
import UiButton from '@/components/UiButton.vue';
import { RouterLink, useRouter } from 'vue-router';

type BannerStat = {
    title: string;
    value: number;
    type: string;
}

type HistoryDA = {
    id: string;
    styles: string[];
    pictures: string[];
}

type StyleRow = {
    styleId: string;
    libelle: string;
    count: number;
}

const bannerStats = ref<BannerStat[]>([]);

const historyDA = ref<HistoryDA[]>([]);

const labelsActivity = ref([])
const seriesA = ref([])
const seriesB = ref([])

const labelsStyles = ref([])
const valuesStyles = ref([])

const router = useRouter();

const historyGridClass = computed(() => {
    const n = historyDA.value.length;
    if (n <= 1) return 'grid-1';
    if (n === 2) return 'grid-2';
    return 'grid-4';
});

const getDashboardData = async ()=> {
    try{
        const data = await getDashboard();
        bannerStats.value = data.dashboard.bannerStat;
        //activity
        labelsActivity.value = data.dashboard.activity.days;
        seriesA.value = data.dashboard.activity.generations;
        seriesB.value = data.dashboard.activity.favorites;
        historyDA.value = data.dashboard.latest4;
        labelsStyles.value = data.dashboard.stylesTop5.map((s: StyleRow) => s.libelle);
        valuesStyles.value = data.dashboard.stylesTop5.map((s: StyleRow) => s.count);
    }catch(err){
        console.log(err);
    }
}

onMounted(()=>{
    getDashboardData()
})

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
    align-items: stretch;
    gap: calc(20 / 16 * 1rem);
    height: 100%;
}

.second-stage-wrapper .history-item-wrapper .history-item.grid-1{
    grid-template-columns: 1fr;
}

.second-stage-wrapper .history-item-wrapper .history-item.grid-2{
    grid-template-columns: repeat(2, 1fr);
}

.second-stage-wrapper .history-item-wrapper .history-item.grid-4{
    grid-template-columns: repeat(2, 1fr);
}


.second-stage-wrapper .history-item-wrapper-void{
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--primary-grey);
    border-radius: var(--border-radius);
    padding: var(--spacing-s);
}

.second-stage-wrapper .history-item-wrapper .history-item .da-wrapper{
    background-color: var(--primary-grey);
    padding: var(--spacing-s);
    border-radius: var(--border-radius);
    height: 100%;
    cursor: pointer;
}


.second-stage-wrapper .history-item-wrapper .history-item .da-wrapper .imgs-wrapper{
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: calc(4 / 16 * 1rem);
    height: calc(80 / 16 * 1rem);
    margin-bottom: var(--spacing-s);
}
.second-stage-wrapper .history-item-wrapper .history-item.grid-1 .imgs-wrapper, .second-stage-wrapper .history-item-wrapper .history-item.grid-2 .imgs-wrapper{
    gap: calc(8 / 16 * 1rem);
    height: calc(180 / 16 * 1rem);
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