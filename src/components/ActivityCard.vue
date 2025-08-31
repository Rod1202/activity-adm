<template>
  <div class="activity-card" :class="{ 'activity-completed': isCompleted, 'activity-pending': isPending }"
    @click="editActivity">
    <div class="activity-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd"
          d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.438-.695Z"
          clip-rule="evenodd" />
      </svg>
    </div>
    <div class="activity-info">
      <div class="activity-header">
        <span class="client-name">{{ activity.clientes_nombre_cliente || 'Sin cliente' }}</span>
        <span class="medio-name">{{ activity.medios_descripcion || 'Sin medio' }}</span>
      </div>
      <p class="activity-description">{{ activity.descripcion || 'Sin descripción.' }}</p>

      <div class="activity-time-and-status">
        <div class="time-info">
          <span class="start-time">Hora de Inicio: {{ formattedStartTime }}</span>
          <span class="time-elapsed"> | Tiempo Transcurrido : {{ formatDuration(activity.duracion_segundos) }}</span>
        </div>
        <span class="activity-status" :class="statusClass">{{ activityStatus }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
});
const router = useRouter();

const editActivity = () => {
  // Redirigir a la vista de edición pasando el ID de la actividad
  router.push({ name: 'EditActivity', params: { id: props.activity.actividad_id } });
};

// Determinar el estado de la actividad
const isPending = computed(() => {
  return props.activity.estado_actividad_id === 1 ||
    props.activity.estados_actividad_nombre_estado === 'Pendiente';
});

const isCompleted = computed(() => {
  return props.activity.estado_actividad_id === 3 ||
    props.activity.estados_actividad_nombre_estado === 'Completado';
});

const isCanceled = computed(() => {
  return props.activity.estado_actividad_id === 4 ||
    props.activity.estados_actividad_nombre_estado === 'Cancelado';
});

const activityStatus = computed(() => {
  if (isCompleted.value) return 'Completado';
  if (isPending.value) return 'Pendiente';
  if (isCanceled.value) return 'Cancelado';
  return 'Desconocido';
});

const statusClass = computed(() => {
  if (isCompleted.value) return 'status-completed';
  if (isPending.value) return 'status-pending';
  if (isCanceled.value) return 'status-canceled';
  return '';
});

// NUEVA PROPIEDAD COMPUTADA: Formato de la hora de inicio (HH:MM AM/PM)
const formattedStartTime = computed(() => {
  if (!props.activity.hora_inicio) {
    return 'N/A';
  }
  try {
    // Asume que hora_inicio es una cadena "HH:MM:SS" o "HH:MM"
    const [hours, minutes] = props.activity.hora_inicio.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0); // Asegura que los segundos son 0 si no están presentes

    // Formatear a hora local con AM/PM
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    console.error('Error al formatear hora de inicio:', e);
    return props.activity.hora_inicio; // Retorna el valor original si hay error
  }
});

const formatDuration = (seconds) => {
  if (typeof seconds !== 'number' || seconds < 0) {
    return '00:00:00';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const pad = (num) => String(num).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};
</script>

<style scoped>
.activity-card {
  display: flex;
  background-color: var(--card-background);
  border-radius: 15px;
  padding: 15px 20px;
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  align-items: flex-start;
  gap: 15px;
}

.activity-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background-color: #e0e0e0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #555;
}

.activity-icon svg {
  width: 24px;
  height: 24px;
}

.activity-info {
  flex-grow: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.client-name {
  font-weight: 600;
  color: var(--accent-darkblue);
  font-size: 1.1em;
  margin-right: 10px;
}

.medio-name {
  font-size: 0.9em;
  color: var(--secondary-color);
  background-color: rgb(247, 201, 0);
  padding: 4px 8px;
  border-radius: 8px;
  white-space: nowrap;
}

/* NUEVO CONTENEDOR PARA TIEMPO Y ESTADO */
.activity-time-and-status {
  display: flex;
  justify-content: space-between;
  /* Espacio entre el tiempo y el estado */
  align-items: center;
  margin-top: 5px;
  /* Margen superior para separarlo de la descripción */
  flex-wrap: wrap;
  /* Permitir que se envuelva en pantallas pequeñas */
}

.time-info {
  font-size: 0.9em;
  /* Un poco más pequeño para los detalles de tiempo */
  color: var(--text-color-light);
  /* Color más suave */
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /* Asegurar que "Hora de Inicio" y "Tiempo Transcurrido" también se envuelvan si es necesario */
}

.start-time {
  font-weight: 600;
  /* Hora de inicio más prominente */
  color: var(--primary-color);
  /* Color primario para la hora de inicio */
}

.time-elapsed {
  font-weight: 600;
  /* También prominente */
  color: var(--primary-color);
  /* Color primario para el tiempo transcurrido */
  margin-left: 5px;
  /* Pequeño margen entre ellos */
}


.activity-status {
  font-size: 0.85em;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
  /* Asegura que el estado no se encoja y mantenga su tamaño */
  flex-shrink: 0;
}

.status-completed {
  background-color: #4caf50;
  color: white;
}

.status-pending {
  background-color: #ff9800;
  color: white;
}

.status-canceled {
  background-color: #f44336;
  color: white;
}

.activity-completed {
  border-left: 4px solid #4caf50;
}

.activity-pending {
  border-left: 4px solid #ff9800;
}

.activity-description {
  font-size: 0.95em;
  color: var(--text-color-medium);
  margin-bottom: 8px;
  line-height: 1.4;
}

/* Eliminar .time-used, ya que ahora está dentro de .time-info */
/* .time-used {
font-weight: 700;
color: var(--primary-color);
font-size: 1em;
} */
</style>
