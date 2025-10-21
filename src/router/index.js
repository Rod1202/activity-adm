import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../services/supabaseClient';
import { getCurrentUserData, hasRole } from '../services/authService';

// Importa tus componentes de vista
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import EditActivityView from '../views/EditActivityView.vue';
import RegisterActivityView from '../views/RegisterActivityView.vue';
import AdminReportsView from '../views/AdminReportsView.vue';
import ClientsView from '../views/ClientsView.vue';
import NotificationsView from '../views/NotificationsView.vue';
import ProfileView from '../views/ProfileView.vue';
import CalendarPickerView from '../views/CalendarPickerView.vue';
import AssignActivityView from '../views/AssignActivityView.vue';
import DeviceRegisterView from '../views/DeviceRegisterView.vue';
import SelectCategoryActivity from '../views/SelectCategoryActivity.vue';
import SelectSubCategoryActivity from '../views/SelectSubCategoryActivity.vue';
import RegisterActivityTecnical from '../views/RegisterActivityTecnical.vue';

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
      name: 'dashboard',
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
      path: '/calendar',
      name: 'calendar',
      component: CalendarPickerView,
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
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/clients',
      name: 'clients',
      component: ClientsView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/edit-activity/:id',
      name: 'EditActivity',
      component: EditActivityView,
      meta: { requiresAuth: true },
    },
    {
      path: '/assign-activity',
      name: 'assign-activity',
      component: AssignActivityView,
      meta: { requiresAuth: true, requiresJefe: true },
    },
    {
      path: '/device-register',
      name: 'device-register',
      component: DeviceRegisterView,
      meta: { requiresAuth: true, requiresTecnico: true },
    },
    {
      path: '/select-category',
      name: 'select-category',
      component: SelectCategoryActivity,
      meta: { requiresAuth: true, requiresTecnico: true },
    },
    {
      path: '/select-subcategory/:categoryId',
      name: 'select-subcategory',
      component: SelectSubCategoryActivity,
      props: true,
      meta: { requiresAuth: true, requiresTecnico: true },
    },
    {
      path: '/register-activity-tecnical',
      name: 'register-activity-tecnical',
      component: RegisterActivityTecnical,
      meta: { requiresAuth: true, requiresTecnico: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
});

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;
  const userData = isLoggedIn ? await getCurrentUserData() : null;

  // 1. Si la ruta requiere autenticación y el usuario no está logueado, redirige al login.
  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    next({ name: 'login' });
    return;
  }

  // 2. Si el usuario está logueado, verifica los roles
  if (isLoggedIn) {
    // Si la ruta requiere el rol de Admin y el usuario no tiene ese rol, redirige al dashboard.
    if (to.matched.some(record => record.meta.requiresAdmin) && !(userData && await hasRole([1, 4, 5, 6, 7]))) {
      next({ name: 'dashboard' });
      return;
    }

    // Si la ruta requiere el rol de Jefe y el usuario no tiene ese rol, redirige al dashboard.
    if (to.matched.some(record => record.meta.requiresJefe) && !(userData && await hasRole([4, 5, 6, 7]))) {
      next({ name: 'dashboard' });
      return;
    }

    // Si la ruta requiere el rol de Técnico y el usuario no tiene ese rol, redirige al dashboard.
    // Esta es la corrección clave.
    if (to.matched.some(record => record.meta.requiresTecnico) && !(userData && userData.rol_id === 3)) {
      next({ name: 'dashboard' });
      return;
    }

    // Si el usuario es un técnico, no debe poder acceder a la vista de registro de actividad general.
    if (userData && userData.rol_id === 3 && to.name === 'register-activity') {
      next({ name: 'dashboard' }); // O a la ruta que consideres apropiada para técnicos
      return;
    }
  }

  // 3. Permite la navegación si todas las condiciones se cumplen
  next();
});

export default router
