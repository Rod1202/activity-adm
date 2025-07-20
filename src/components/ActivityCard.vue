<template>
  <div class="activity-card">
    <div class="activity-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.438-.695Z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="activity-info">
      <div class="activity-header">
        <span class="client-name">{{ activity.clientes?.nombre_cliente || 'Sin cliente' }}</span>
        <span class="category-name">{{ activity.categoriasactividad?.nombre_categoria || 'Sin categoría' }}</span>
      </div>
      <p class="activity-description">{{ activity.descripcion || 'Sin descripción.' }}</p>
      <span class="time-used">{{ formatDuration(activity.duracion_segundos) }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  activity: {
    type: Object,
    required: true
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

.category-name {
  font-size: 0.9em;
  color: var(--secondary-color);
  background-color:rgb(247, 201, 0);
  padding: 4px 8px;
  border-radius: 8px;
  white-space: nowrap;
}

.activity-description {
  font-size: 0.95em;
  color: var(--text-color-medium);
  margin-bottom: 8px;
  line-height: 1.4;
}

.time-used {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1em;
}
</style>