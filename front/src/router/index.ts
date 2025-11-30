import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/pages/LoginView.vue'
import Register from '@/pages/RegisterView.vue'
import DashboardView from '@/pages/DashboardView.vue'
import AccountView from '@/pages/AccountView.vue'
import ResetPasswordView from '@/pages/ResetPasswordView.vue'
import ArtDirectionView from '@/pages/ArtDirectionView.vue'
import ArtDirectionDeteilView from '@/pages/ArtDirectionDeteilView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Login,
      meta: {
        requiresAuth: false,
        guest: true,
      },
    },
    {
      path: '/register',
      component: Register,
      meta: {
        requiresAuth: false,
        guest: true,
      },
    },
    {
      path: '/create-da',
      component: ArtDirectionView,
      meta: {
        requiresAuth: true,
        guest: false,
      },
    },
    {
      path: '/art-directions/:id',
      name: 'art-direction-detail',
      component: ArtDirectionDeteilView,
      meta: {
        requiresAuth: true,
        guest: false,
      }
    },
    {
      path: '/dashboard',
      component: DashboardView,
      meta: {
        requiresAuth: true,
        guest: false,
      },
    },
    {
      path: '/account',
      component: AccountView,
      meta: {
        requiresAuth: true,
        guest: false,
      },
    },
    {
      path: '/reset-password',
      component: ResetPasswordView,
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!auth.hydrated) await auth.hydrate();
    if (!auth.isAuthenticated) {
      return { path: '/', query: { redirect: to.fullPath } };
    }
    return true;
  }

  if (to.meta.guest && auth.hydrated && auth.isAuthenticated) {
    return { path: '/dashboard' };
  }

  return true;
});

export default router
