// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../services/supabaseClient';
import { getCurrentUserData, hasRole } from '../services/authService';

// Importa tus componentes de vista
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue'; // Tu vista de actividades
import EditActivityView from '../views/EditActivityView.vue';
import RegisterActivityView from '../views/RegisterActivityView.vue';
import AdminReportsView from '../views/AdminReportsView.vue';
import ClientsView from '../views/ClientsView.vue'; // <-- Importa la nueva vista de gestión de clientes

// --- NUEVAS VISTAS PARA EL BOTTOM NAVIGATION ---
import NotificationsView from '../views/NotificationsView.vue';
import ProfileView from '../views/ProfileView.vue';
import CalendarPickerView from '../views/CalendarPickerView.vue'; // <-- Importa la nueva vista de calendario
import AssignActivityView from '../views/AssignActivityView.vue'; // <-- Importa la nueva vista de asignación

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'dashboard', // Mantén el nombre 'dashboard' o cámbialo a 'activities-list' si prefieres
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/home',
      name: 'home',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/calendar', // Ruta para el icono "Calendar" del BottomNavigation
      name: 'calendar', // Nombre de la ruta para el calendario interactivo
      component: CalendarPickerView, // Asigna el nuevo componente de calendario
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/register-activity',
      name: 'register-activity',
      component: RegisterActivityView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin-reports',
      name: 'admin-reports',
      component: AdminReportsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/clients',
      name: 'clients',
      component: ClientsView,
      meta: { requiresAuth: true },
    },
    {
    path: '/edit-activity/:id', // Ruta con parámetro dinámico 'id'
    name: 'EditActivity',
    component: EditActivityView,
    meta: { requiresAuth: true }
    },
    {
      path: '/assign-activity',
      name: 'assign-activity',
      component: AssignActivityView,
      meta: { requiresAuth: true, requiresJefe: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
});

router.beforeEach(async (to, from, next) => {
  const { data: { session }, error } = await supabase.auth.getSession();
  const requiresAuth = to.meta.requiresAuth;
  const isLoggedIn = !!session;

  if (requiresAuth && !isLoggedIn) {
    next('/login');
    return;
  } 
  
  if (to.name === 'login' && isLoggedIn) {
    next('/');
    return;
  }
  
  // Verificar permisos para rutas específicas
  if (isLoggedIn && (to.name === 'admin-reports' || to.name === 'clients' || to.meta.requiresJefe)) {
    // Verificar si el usuario tiene rol de administrador (1) o jefe (4, 5, 6, 7)
    const tienePermiso = await hasRole([1, 4, 5, 6, 7]);
    if (!tienePermiso) {
      // Si no tiene permiso, redirigir al dashboard
      next('/');
      return;
    }
  }
  
  next();
});

export default router;
