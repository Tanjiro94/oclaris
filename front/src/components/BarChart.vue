<template>
    <div class="chart-wrap">
    <Bar :data="chartData" :options="chartOptions" />
    </div>
</template>

<script lang="ts" setup>
import { computed, withDefaults } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
} from 'chart.js'
import type { TooltipItem } from 'chart.js'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const props = withDefaults(defineProps<{
    labels: string[]
    values: number[]
    title?: string
    color?: string
    bgGrid?: string
    tickColor?: string 
}>(), {
    title: '',
    color: '#B487F6',
    bgGrid: 'rgba(255,255,255,0.08)',
    tickColor: 'rgba(255,255,255,0.8)',
})

const chartData = computed(() => ({
    labels: props.labels,
    datasets: [
    {
        label: props.title || undefined,
        data: props.values,
        backgroundColor: props.color,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: props.color,
        categoryPercentage: .9,
        barPercentage: .9,
    },
    ],
}))

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 8 },
    plugins: {
    legend: { display: false },
    title: props.title
        ? {
            display: true,
            align: 'start' as const,
            text: props.title,
            color: props.tickColor,
            font: { weight: 600, size: 14 },
            padding: { bottom: 8 },
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
        label: (ctx: TooltipItem<'bar'>) => `${ctx.formattedValue}`,
        },
    },
    },
    scales: {
    x: {
        grid: { display: false },
        border: {
            display: false,
        },
        ticks: {
        color: props.tickColor,
        font: { size: 14 },
        fontWeight: 600,
        padding: 4,
        },
    },
    y: {
        display: false,
        beginAtZero: true,
        border: {
            display: false,
        },
        grid: {
            display: false,
            color: props.bgGrid,
            drawBorder: false,
        },
        ticks: {
        color: props.tickColor,
        font: { size: 12 },
        padding: 6,
        },
    },
    },
    animation: {
        duration: 500,
        easing: 'easeOutCubic' as const,
    },
}))
</script>

<style scoped>
.chart-wrap{
    width: 100%;
    height: 100%;
}
</style>