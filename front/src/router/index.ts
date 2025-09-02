import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Login,
    },
  ],
})

export default router
