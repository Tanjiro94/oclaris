<template>
    <div class="skeleton-container"  :style="{width: props.width, height: props.height}" :class="props.classStyle" v-if="props.loading">
        <div class="skeleton-effect"></div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
    width: {
        type: String,
    },
    loading: {
        type: Boolean,
        default: true
    },
    height: {
        type: String,
        default: '20px'
    },
    classStyle:{
        type: Array,
        default: () => []
    },
});

</script>


<style scoped>
.skeleton-container {
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    background-color: white;
}
.skeleton-container::before,
.skeleton-container::after {
content: "";
position: absolute;
top: 0; left: -100%;
width: 100%;
height: 100%;
background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(240,240,240,0.8) 50%,
    transparent 100%
);
transform: skewX(-20deg);
filter: blur(4px);
animation: shimmer 2s infinite ease-in-out;
}

.skeleton-container::after {
animation-delay: 1s;
}

@keyframes shimmer {
0%   { transform: translateX(-100%) skewX(-20deg); }
100% { transform: translateX(200%)  skewX(-20deg); }
}
</style>