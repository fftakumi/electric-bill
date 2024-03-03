import { createRouter, createWebHistory } from 'vue-router'
import CalculateBill from '@/views/CalculateBill.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CalculateBill
    },
  ]
})

export default router
