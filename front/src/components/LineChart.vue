<template>
    <div class="chart-wrap">
    <Line :data="chartData" :options="chartOptions" />
    </div>
</template>

<script lang="ts" setup>
import { computed, withDefaults } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
} from 'chart.js'
import type { TooltipItem } from 'chart.js'
Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const props = withDefaults(defineProps<{
    labels: string[]
    seriesA: number[]
    seriesB: number[]
    title?: string
    colorA?: string
    colorB?: string
    tickColor?: string
}>(), {
    title: '',
    colorA: '#B487F6',
    colorB: '#5BE2E2',
    tickColor: 'rgba(255,255,255,0.8)',
})

const chartData = computed(() => ({
    labels: props.labels,
    datasets: [
    {
        label: 'Série A',
        data: props.seriesA,
        borderColor: props.colorA,
        backgroundColor: props.colorA,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
    },
    {
        label: 'Série B',
        data: props.seriesB,
        borderColor: props.colorB,
        backgroundColor: props.colorB,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
    },
    ],
}))

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 8, right: 8, top: 4, bottom: 8 } },
    interaction: {
    mode: 'nearest' as const,
    intersect: false,
    axis: 'x' as const,
    },
    plugins: {
    legend: { display: false },
    title: props.title
        ? {
            display: true,
            text: props.title,
            color: props.tickColor,
            font: { weight: 600, size: 14 },
            padding: { bottom: 8 },
            align: 'start' as const,
        }
        : { display: false },
    tooltip: {
        enabled: true,
        backgroundColor: 'rgba(20,20,20,0.9)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        displayColors: false,
        callbacks: {
        label: (ctx: TooltipItem<'line'>) => `${ctx.formattedValue}`,
        },
    },
    },
    scales: {
    x: {
        grid: { display: false },  
        ticks: {
        color: props.tickColor,  
        font: { size: 14 },
        fontWeight: 600,
        padding: 6,
        },
        border: { display: false },
    },
    y: {
        beginAtZero: false,
        grid: { display: false, drawBorder: false },
        ticks: { display: false },                  
        border: { display: false },               
    },
    },
    animation: {
    duration: 500,
    easing: 'easeOutCubic' as const,
    },
}))
</script>

<style scoped>
.chart-wrap {
    width: 100%;
    height: 100%;
}
</style>