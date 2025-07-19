// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '@/services/supabaseClient'; // Importa el cliente de Supabase

// Importa tus componentes de vista
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
// Importa los demás componentes cuando los crees
import RegisterActivityView from '@/views/RegisterActivityView.vue';
import AdminReportsView from '@/views/AdminReportsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/', // La ruta raíz será tu dashboard principal
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }, // Esta ruta requiere que el usuario esté autenticado
    },
    {
      path: '/register-activity',
      name: 'register-activity',
      component: RegisterActivityView,
      meta: { requiresAuth: true }, // Esta ruta también requiere autenticación
    },
    {
      path: '/admin-reports',
      name: 'admin-reports',
      component: AdminReportsView,
      meta: { requiresAuth: true }, // Esta ruta también requiere autenticación
    },
    // Ruta comodín para redirigir a la página principal si la URL no existe
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
});

// Guardia de navegación global para proteger rutas
router.beforeEach(async (to, from, next) => {
  // Obtener la sesión actual de Supabase
  const { data: { session }, error } = await supabase.auth.getSession();

  const requiresAuth = to.meta.requiresAuth; // Verifica si la ruta necesita autenticación
  const isLoggedIn = !!session; // True si hay una sesión, false si no

  if (requiresAuth && !isLoggedIn) {
    // Si la ruta requiere autenticación Y el usuario NO está logueado, redirige al login
    next('/login');
  } else if (to.name === 'login' && isLoggedIn) {
    // Si el usuario SÍ está logueado E intenta ir a la página de login, redirige al dashboard
    next('/');
  } else {
    // Si no se cumple ninguna de las condiciones anteriores, permite la navegación
    next();
  }
});

export default router;