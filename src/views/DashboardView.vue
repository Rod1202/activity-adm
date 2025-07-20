<template>
  <div class="phone-mockup dashboard-mockup">
    <header class="dashboard-header">
      <h1 class="welcome-title">BIENVENIDO {{ userName }}</h1>
      <div class="header-actions">
        <button class="icon-button logout-icon" @click="handleLogout" title="Cerrar Sesión">
          <i class="fi fi-rs-sign-out-alt"></i>
        </button>
        <button class="add-button" @click="goToRegisterActivity">
          <span class="plus-icon">+</span>
        </button>
      </div>
    </header>

    <main class="dashboard-content">
      <section class="activity-list">
        <div v-if="activities.length === 0 && !isLoadingActivities" class="no-activities-message">
          No hay actividades para esta fecha.
        </div>
        <div v-else-if="isLoadingActivities" class="loading-message">
          Cargando actividades...
        </div>
        <div v-else>
          <ActivityCard
            v-for="activity in activities"
            :key="activity.actividad_id"
            :activity="activity"
          />
        </div>
      </section>

      <section class="day-navigation">
        <DayNavigation
          :selectedDate="selectedDate"
          @update:selectedDate="handleDateChange"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser } from '@/services/authService';
import { supabase } from '@/services/supabaseClient';

import ActivityCard from '@/components/ActivityCard.vue';
import DayNavigation from '@/components/DayNavigation.vue';

const router = useRouter();
const userName = ref('...');
const selectedDate = ref(new Date());
const activities = ref([]);
const isLoadingActivities = ref(false);

const fetchActivities = async () => {
  isLoadingActivities.value = true;
  try {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const formattedDate = selectedDate.value.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('actividades')
      .select('*, clientes(nombre_cliente), categoriasactividad(nombre_categoria)')
      .eq('adm_id', user.id)
      .eq('fecha_actividad', formattedDate)
      .order('hora_inicio', { ascending: true });

    if (error) {
      throw error;
    }
    activities.value = data || [];
  } catch (err) {
    console.error('Error al cargar actividades:', err.message);
    activities.value = [];
  } finally {
    isLoadingActivities.value = false;
  }
};

const handleDateChange = (newDate) => {
  selectedDate.value = newDate;
  fetchActivities();
};

const goToRegisterActivity = () => {
  router.push('/register-activity');
};

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message);
    alert('No se pudo cerrar sesión. Por favor, intenta de nuevo.');
  }
};

onMounted(async () => {
  try {
    const user = await getCurrentUser();
    if (user) {
      if (user.user_metadata && user.user_metadata.full_name) {
        userName.value = user.user_metadata.full_name.split(' ')[0].toUpperCase();
      } else if (user.email) {
        userName.value = user.email.split('@')[0].toUpperCase();
      }
    }
    fetchActivities();
  } catch (error) {
    console.error('Error al obtener usuario o actividades en dashboard:', error.message);
  }
});
</script>

<style scoped>
/* Contenedor principal del mockup (manteniendo la simulación de teléfono para este componente) */
.phone-mockup {
  width: 100%;
  max-width: 1000px; /* Ancho igual que RegisterActivityView.vue */
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 800px; /* Altura igual que RegisterActivityView.vue */
  overflow: hidden;
  position: relative;
  margin: 20px auto; /* Centra el contenedor */
}

.dashboard-mockup {
  padding: 0;
}

.dashboard-header {
  background-color: var(--primary-color);
  color: #fff;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between; /* Para separar el título de los botones */
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  flex-shrink: 0; /* Evita que el header se encoja */
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  flex-grow: 1; /* Permite que el título ocupe el espacio restante */
  color: #fff;
}

/* Renombramos 'header-buttons' a 'header-actions' para mayor claridad */
.header-actions {
  display: flex;
  gap: 15px; /* Espacio entre el icono de cerrar sesión y el botón de añadir */
  align-items: center;
}

.add-button {
  background-color: var(--secondary-color);
  border: none;
  border-radius: 50%; /* Circular */
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease, transform 0.2s ease;
  flex-shrink: 0; /* Evita que el botón se encoja */
}

.add-button:hover {
  background-color: var(--accent-purple);
  transform: translateY(-2px);
}

.add-button:active {
  transform: translateY(0);
}

.add-button:disabled {
  background-color: #e5e7eb;
  color: #bdbdbd;
}

.plus-icon {
  font-size: 30px;
  color: var(--primary-color);
  line-height: 1; /* Para centrar el '+' */
}

/* Nuevos estilos para el icono de cerrar sesión */
.icon-button {
  background: none; /* Sin fondo */
  border: none; /* Sin borde */
  color: white; /* Color del icono */
  font-size: 24px; /* Tamaño del icono */
  cursor: pointer;
  padding: 8px; /* Pequeño padding para el área de clic */
  border-radius: 50%; /* Hacerlo circular al pasar el ratón */
  transition: background-color 0.2s ease, color 0.2s ease;
  display: flex; /* Para centrar el icono si es necesario */
  justify-content: center;
  align-items: center;
}

.icon-button:hover {
  background-color: var(--accent-pink);
}

.icon-button:active {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Ajustes específicos para el icono de logout */
.logout-icon i {
  color: white; /* Asegura que el icono sea blanco */
  font-size: 24px; /* Asegura el tamaño del icono */
}


.dashboard-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 30px;
  overflow-y: auto;
  padding-bottom: 100px; /* Espacio para la navegación de días flotante */
  min-height: 0; /* Permite que el contenido se encoja si es necesario */
}

.activity-list {
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
  max-height: calc(100% - 80px);
  padding-bottom: 0;
}

.no-activities-message, .loading-message {
  text-align: center;
  color: var(--accent-darkblue);
  margin-top: 50px;
  font-size: 1.1em;
}

.day-navigation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20px 30px; /* Aumentamos el padding para mejor distribución */
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  z-index: 10;
  flex-shrink: 0; /* Evita que la navegación se encoja */
  display: flex;
  justify-content: center; /* Centra los cards horizontalmente */
  align-items: center;
}

/* Estilos para mejorar la distribución de los cards de fecha */
.day-navigation :deep(.day-navigation-container) {
  display: flex;
  gap: 20px; /* Espacio uniforme entre cards */
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 700px; /* Limita el ancho máximo para mejor distribución */
  padding: 0; /* Eliminamos el padding del componente para controlarlo desde aquí */
}

.day-navigation :deep(.day-button) {
  flex: 1;
  min-width: 90px; /* Ancho mínimo para cada botón */
  max-width: 130px; /* Ancho máximo para evitar botones muy anchos */
  height: 80px; /* Altura fija para mejor proporción */
  background-color: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: var(--text-color-medium);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.day-navigation :deep(.day-button:hover) {
  background-color: #e8e8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-navigation :deep(.day-button.active) {
  background-color: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(74, 85, 162, 0.3);
}

.day-navigation :deep(.day-button:not(.active)) {
  background-color: #d1d5db;
  color: #fff;
}

.day-navigation :deep(.day-button.active .day-name),
.day-navigation :deep(.day-button.active .day-month),
.day-navigation :deep(.day-button.active .day-number) {
  color: white;
}

.day-navigation :deep(.day-name) {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
}

.day-navigation :deep(.day-month) {
  font-size: 10px;
  opacity: 0.9;
  margin-bottom: 2px;
}

.day-navigation :deep(.day-number) {
  font-size: 18px;
  font-weight: 700;
  margin-top: 2px;
}

/* Media queries para responsividad */
@media (max-width: 768px) {
  .phone-mockup {
    max-width: none;
    border-radius: 0;
    height: 100vh; /* Ocupa toda la altura en móvil */
    box-shadow: none;
    margin: 0;
  }

  .dashboard-header {
    flex-direction: row; /* Mantener en fila en móvil para que el icono se vea bien */
    align-items: center;
    padding: 20px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .welcome-title {
    font-size: 1.5em; /* Un poco más pequeño en móvil */
    margin-bottom: 0; /* No hay margen inferior si están en fila */
    flex-grow: 1;
  }

  .header-actions {
    /* En móvil, los botones de acción pueden estar a la derecha */
    gap: 10px; /* Espacio entre los iconos */
  }

  .add-button {
    width: 40px; /* Un poco más pequeño en móvil */
    height: 40px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .add-button .plus-icon {
    font-size: 26px; /* Ajusta el tamaño del icono más para móvil */
  }

  /* El icono de logout también se ajusta con .icon-button */
  .icon-button {
    font-size: 20px; /* Tamaño del icono en móvil */
    padding: 6px;
  }

  .dashboard-content {
    padding: 15px 20px;
    border-radius: 0;
  }

  .day-navigation {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}
</style>