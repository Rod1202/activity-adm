<template>
  <div class="phone-mockup dashboard-mockup">
    <header class="new-dashboard-header">
      <h1 class="header-title">Mis Actividades</h1>
    </header>

    <main class="dashboard-content-new">
      <section class="summary-section">
        <p class="total-hours">Total horas usadas: {{ totalHoursUsed }} | {{ formattedCurrentDate }}</p>
      </section>

      <section class="tab-navigation">
        <button
          :class="{ 'tab-button': true, 'active': currentTab === 'inProgress' }"
          @click="currentTab = 'inProgress'"
        >
          En Progreso
        </button>
        <button
          :class="{ 'tab-button': true, 'active': currentTab === 'completed' }"
          @click="currentTab = 'completed'"
        >
          Completado
        </button>
      </section>

      <section class="activity-list-new">
        <div v-if="filteredActivities.length === 0 && !isLoadingActivities" class="no-activities-message">
          {{ currentTab === 'inProgress' ? 'No hay actividades en progreso.' : 'No hay actividades completadas.' }}
        </div>
        <div v-else-if="isLoadingActivities" class="loading-message">
          Cargando actividades...
        </div>
        <div v-else>
          <ActivityCard
            v-for="activity in filteredActivities"
            :key="activity.actividad_id"
            :activity="activity"
          />
        </div>
      </section>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getCurrentUser } from '@/services/authService';
import { supabase } from '@/services/supabaseClient';
import { getUserActivities } from '@/services/userService';

import ActivityCard from '@/components/ActivityCard.vue';
import BottomNavigation from '@/components/BottomNavigation.vue'; 

const router = useRouter();
const route = useRoute();
const userName = ref('...');
const selectedDate = ref(new Date());
const activities = ref([]);
const isLoadingActivities = ref(false);
const currentTab = ref('inProgress');

// Computed property para el total de horas usadas
const totalHoursUsed = computed(() => {
  let totalMinutes = 0;
  // Suma SOLO las actividades que están COMPLETADAS y tienen hora_fin
  const completedActivities = activities.value.filter(activity => 
    activity.estado_actividad_id === 3 && activity.hora_fin // Solo actividades Completadas Y con hora_fin
  );

  completedActivities.forEach(activity => {
    // Es CRÍTICO verificar que hora_inicio y hora_fin no sean null
    if (activity.hora_inicio && activity.hora_fin) {
        const [startHour, startMinute] = activity.hora_inicio.split(':').map(Number);
        const [endHour, endMinute] = activity.hora_fin.split(':').map(Number);

        const startTimeInMinutes = startHour * 60 + startMinute;
        let endTimeInMinutes = endHour * 60 + endMinute;

        // Manejar actividades que cruzan la medianoche
        if (endTimeInMinutes < startTimeInMinutes) {
            endTimeInMinutes += 24 * 60; // Sumar 24 horas en minutos
        }

        totalMinutes += (endTimeInMinutes - startTimeInMinutes);
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
});

// Computed property para la fecha actual formateada (ej: Monday, July 28)
const formattedCurrentDate = computed(() => {
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  let dateString = selectedDate.value.toLocaleDateString('es-ES', options); 
  
  // Capitalizar la primera letra de la cadena completa
  dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);

  return dateString;
});

// Filtrar actividades basadas en la pestaña seleccionada y la fecha
const filteredActivities = computed(() => {
  const today = selectedDate.value.toISOString().split('T')[0]; // Fecha para filtrar

  return activities.value.filter(activity => {
    // Asegurarse de que la actividad es para el día seleccionado
    const activityDate = new Date(activity.fecha_actividad + 'T00:00:00'); 
    const isToday = activityDate.toISOString().split('T')[0] === today;

    if (!isToday) return false;

    // Verificar el estado de la actividad según la nueva estructura
    const isPendiente = activity.estado_actividad_id === 1 || 
                       (activity.estados_actividad_nombre_estado === 'Pendiente');
    const isCompletado = activity.estado_actividad_id === 3 || 
                         (activity.estados_actividad_nombre_estado === 'Completado');
    const isCancelado = activity.estado_actividad_id === 4 ||
                        (activity.estados_actividad_nombre_estado === 'Cancelado');

    if (currentTab.value === 'inProgress') {
      // Mostrar actividades pendientes en la pestaña "En Progreso"
      return isPendiente;
    } else if (currentTab.value === 'completed') {
      // Mostrar actividades completadas en la pestaña "Completado"
      return isCompletado;
    }
    return false; // Por si hay otro estado
  });
});


const fetchActivities = async () => {
  isLoadingActivities.value = true;
  try {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const formattedDate = selectedDate.value.toISOString().split('T')[0];

    // Usar el nuevo servicio para obtener actividades
    const activitiesData = await getUserActivities(user.id, {
      fecha: formattedDate
    });
    
    // IMPORTANTE: Asegúrate de que los datos de la API incluyan
    // 'estados_actividad_nombre_estado' para que la lógica de filteredActivities funcione.
    activities.value = activitiesData || [];
  } catch (err) {
    console.error('Error al cargar actividades:', err.message);
    activities.value = [];
  } finally {
    isLoadingActivities.value = false;
  }
};

watch(() => route.query.date, (newDate) => {
  if (newDate) {
    selectedDate.value = new Date(newDate + 'T00:00:00');
  } else {
    selectedDate.value = new Date();
  }
  fetchActivities();
});

onMounted(async () => {
  try {
    if (route.query.date) {
      selectedDate.value = new Date(route.query.date + 'T00:00:00');
    }

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
/* Contenedor principal del mockup */
.phone-mockup {
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 800px;
  overflow: hidden;
  position: relative;
  margin: 20px auto;
}

.dashboard-mockup {
  padding: 0;
}

/* --- Nuevo Header "My Activities" --- */
.new-dashboard-header {
  background-color: var(--primary-color); /* Usamos el color principal de tu tema */
  color: #fff;
  padding: 25px 30px;
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  flex-shrink: 0;
}

.header-title {
  font-size: 26px; /* Más grande que el welcome-title */
  font-weight: 700;
  margin: 0;
  color: #fff;
}

/* --- Contenido Principal Adaptado --- */
.dashboard-content-new {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 30px 0; /* padding-bottom se manejará con el espacio para el bottom nav */
  overflow-y: auto;
  min-height: 0;
  padding-bottom: 90px;
}

/* --- Sección de Resumen (Total Horas) --- */
.summary-section {
  text-align: left;
  margin-bottom: 20px;
  color: var(--text-color-medium);
  font-size: 1.1em;
}

.total-hours {
  font-weight: 600;
  color: var(--text-color-dark); /* Color más oscuro para el texto principal */
  font-size: 1.2em;
}

/* --- Navegación por Pestañas --- */
.tab-navigation {
  display: flex;
  justify-content: flex-start; /* Alinear a la izquierda como en el diseño */
  gap: 10px;
  margin-bottom: 20px; /* Espacio debajo de las pestañas */
  border-bottom: 1px solid #e0e0e0; /* Línea separadora */
  padding-bottom: 10px;
}

.tab-button {
  background-color: transparent;
  border: none;
  padding: 10px 15px;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--text-color-light); /* Color por defecto */
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
}

.tab-button.active {
  color: var(--primary-color); /* Color activo */
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -11px; /* Posición de la línea, ajusta si es necesario */
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

/* --- Lista de Actividades (adaptada para las pestañas) --- */
.activity-list-new {
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
  /* El padding-bottom se ajustará automáticamente por el bottom navigation */
}

.no-activities-message, .loading-message {
  text-align: center;
  color: var(--accent-darkblue);
  margin-top: 50px;
  font-size: 1.1em;
}

/* Media queries para responsividad */
@media (max-width: 768px) {
  .phone-mockup {
    max-width: none;
    border-radius: 0; /* Eliminar bordes redondeados en móvil */
    height: 100vh; /* Ocupar toda la altura de la pantalla */
    box-shadow: none; /* Eliminar sombra en móvil */
    margin: 0; /* Eliminar margen en móvil */
  }

  .new-dashboard-header { /* Usamos tu clase `new-dashboard-header` */
    padding: 20px 15px 10px; /* Ajustar padding en móvil */
    border-top-left-radius: 0; /* Eliminar bordes redondeados en móvil */
    border-top-right-radius: 0; /* Eliminar bordes redondeados en móvil */
  }
   .header-title {
    font-size: 22px; /* Ajustar tamaño del título en móvil */
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
