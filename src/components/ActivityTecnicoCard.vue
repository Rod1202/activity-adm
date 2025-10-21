<template>
  <div class="activity-card-tecnico" :class="{ 'activity-completed': isCompleted, 'activity-pending': isPending }">
    <div class="activity-info">
      <div class="activity-header">
        <span class="category-name">{{ activity.cliente_nombre || 'Sin Categoría' }}</span>
        <span class="subcategory-name">{{ activity.proyecto_nombre || 'Sin Subcategoría' }}</span>
      </div>
      <p class="activity-description">{{ activity.observacion || 'Sin observación.' }}</p>
      <div class="activity-time-and-status">
        <div class="time-info">
          <span class="start-time">Inicio: {{ formattedStartTime }}</span>
          <span v-if="isCompleted" class="end-time"> | Fin: {{ formattedEndTime }}</span>
        </div>
        <span class="activity-status" :class="statusClass">{{ activityStatus }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
});

const isPending = computed(() => props.activity.estado_actividad_id === 1);
const isCompleted = computed(() => props.activity.estado_actividad_id === 3);

const activityStatus = computed(() => {
  if (isCompleted.value) return 'Completado';
  if (isPending.value) return 'Pendiente';
  return 'Desconocido';
});

const statusClass = computed(() => {
  if (isCompleted.value) return 'status-completed';
  if (isPending.value) return 'status-pending';
  return '';
});

const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formattedStartTime = computed(() => formatTime(props.activity.hora_inicio));
const formattedEndTime = computed(() => formatTime(props.activity.hora_fin));
</script>

<style scoped>
.activity-card-tecnico {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 5px solid transparent;
}
.activity-pending {
  border-left-color: #ff9800;
}
.activity-completed {
  border-left-color: #4caf50;
}
.activity-info {
  display: flex;
  flex-direction: column;
}
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.category-name {
  font-weight: 600;
  font-size: 1.1em;
  color: #333;
}
.subcategory-name {
  font-size: 0.9em;
  color: #fff;
  background-color: #007bff;
  padding: 4px 8px;
  border-radius: 12px;
}
.activity-description {
  font-size: 0.95em;
  color: #666;
  margin-bottom: 12px;
}
.activity-time-and-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.time-info {
  font-size: 0.9em;
  color: #555;
}
.start-time, .end-time {
  font-weight: 500;
}
.activity-status {
  font-size: 0.85em;
  padding: 4px 10px;
  border-radius: 12px;
  color: #fff;
  font-weight: 500;
}
.status-completed {
  background-color: #4caf50;
}
.status-pending {
  background-color: #ff9800;
}
</style>
