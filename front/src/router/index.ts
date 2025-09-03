import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/LoginView.vue'
import Register from '@/pages/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: Login,
    },
    {
      path: '/register',
      component: Register,
    },
  ],
})

export default router
