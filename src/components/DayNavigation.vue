<template>
  <div class="day-navigation-container">
    <button
      v-for="dateItem in fiveDays"
      :key="dateItem.fullDate"
      :class="{ 'day-button': true, 'active': isSameDay(dateItem.date, selectedDate) }"
      @click="selectDay(dateItem.date)"
    >
      <span class="day-name">{{ dateItem.dayName }}</span>
      <span class="day-month">{{ dateItem.monthName }}</span>
      <span class="day-number">{{ dateItem.dayNumber }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { formatDateToYYYYMMDD } from '@/utils/dateUtils';

const props = defineProps({
  selectedDate: {
    type: Date,
    required: true
  }
});

const emit = defineEmits(['update:selectedDate']);

const fiveDays = computed(() => {
  const dates = [];
  // Empezar 2 días antes y terminar 2 días después de la fecha seleccionada
  for (let i = -2; i <= 2; i++) {
    const date = new Date(props.selectedDate);
    date.setDate(date.getDate() + i);

    // Formateo para nombres de días y meses cortos
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', ''); // Ej. LUN
    const monthName = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', ''); // Ej. ENE
    const dayNumber = date.getDate();

    dates.push({
      date: date,
      fullDate: formatDateToYYYYMMDD(date), // Use utility function
      dayName: dayName,
      monthName: monthName,
      dayNumber: dayNumber,
    });
  }
  return dates;
});

const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const selectDay = (date) => {
  emit('update:selectedDate', date);
};
</script>

<style scoped>
.day-navigation-container {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.day-navigation-container::-webkit-scrollbar {
  display: none;
}

.day-button {
  flex-shrink: 0;
  background-color: var(--secondary-color);
  color: #fff;
  border: 1px solid #ddd;
  border-radius: 15px;
  padding: 10px 0;
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9em;
  color: var(--text-color-medium);
}

.day-button:hover {
  background-color: var(--accent-purple);
  border-color: #ccc;
}

.day-button.active {
  background-color: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.day-button.active .day-name,
.day-button.active .day-month,
.day-button.active .day-number {
  color: white;
}

.day-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.day-month {
  font-size: 0.8em;
  opacity: 0.8;
}

.day-number {
  font-size: 1.2em;
  font-weight: 700;
  margin-top: 3px;
}
</style>
