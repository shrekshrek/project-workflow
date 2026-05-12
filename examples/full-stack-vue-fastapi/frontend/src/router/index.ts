import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/LoginView.vue'),
    meta: { hideForAuth: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/modules/auth/RegisterView.vue'),
    meta: { hideForAuth: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'todos' },
      },
      {
        path: 'todos',
        name: 'todos',
        component: () => import('@/modules/todos/TodosView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const needAuth = to.matched.some((r) => r.meta.requiresAuth)
  const hideForAuth = to.meta.hideForAuth

  if (needAuth && !userStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (hideForAuth && userStore.isAuthenticated) {
    return { name: 'todos' }
  }
  return true
})

export default router
