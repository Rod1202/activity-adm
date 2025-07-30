<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <button class="nav-btn prev-btn" @click="previousMonth">‹</button>
      <div class="month-year">{{ currentMonthYear }}</div>
      <button class="nav-btn next-btn" @click="nextMonth">›</button>
    </div>

    <div class="calendar-grid">
      <div class="weekdays">
        <div class="weekday">Dom</div>
        <div class="weekday">Lun</div>
        <div class="weekday">Mar</div>
        <div class="weekday">Mié</div>
        <div class="weekday">Jue</div>
        <div class="weekday">Vie</div>
        <div class="weekday">Sáb</div>
      </div>
      <div class="days">
        <div
          v-for="(day, index) in daysInMonth"
          :key="index"
          :class="getDayClasses(day)"
          @click="day.isCurrentMonth && selectDate(day.date)"
        >
          <span>{{ day.dayNumber }}</span>
        </div>
      </div>
    </div>

    <div class="selected-date">
      {{ formattedSelectedDate }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineEmits, defineProps } from 'vue';

const props = defineProps({
  initialDate: {
    type: Date,
    default: () => new Date(),
  },
});

const emit = defineEmits(['update:selectedDate']);

const currentDate = ref(new Date(props.initialDate));
const selectedDate = ref(props.initialDate ? new Date(props.initialDate) : null);

watch(() => props.initialDate, (newDate) => {
  if (newDate) {
    selectedDate.value = new Date(newDate);
    currentDate.value = new Date(newDate);
  }
}, { immediate: true });

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const currentMonthYear = computed(() => {
  return `${monthNames[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`;
});

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) {
    return ''; // Devuelve una cadena vacía si no hay fecha seleccionada
  }
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  // Quitamos la etiqueta <span> directamente aquí, solo devolvemos el texto formateado
  return selectedDate.value.toLocaleDateString('es-ES', options);
});

const daysInMonth = computed(() => {
  const days = [];
  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
  const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);

  const startDayOfWeek = firstDay.getDay();

  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startDayOfWeek);

  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);

    days.push({
      date: day,
      dayNumber: day.getDate(),
      isCurrentMonth: day.getMonth() === currentDate.value.getMonth(),
      isToday: day.toDateString() === new Date().toDateString(),
      isSelected: selectedDate.value && day.toDateString() === selectedDate.value.toDateString()
    });
  }
  return days;
});

const getDayClasses = (day) => {
  return {
    'day': true,
    'other-month': !day.isCurrentMonth,
    'today': day.isToday && day.isCurrentMonth,
    'selected': day.isSelected
  };
};

const selectDate = (date) => {
  selectedDate.value = new Date(date);
  emit('update:selectedDate', selectedDate.value);
};

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1));
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1));
};
</script>

<style scoped>
/* Las variables CSS personalizadas como --primary-color deben estar definidas globalmente
   o importadas de alguna manera en tu proyecto Vue.
   Asegúrate de que ':root { --primary-color: #4A55A2; }' o similar esté en tu CSS principal. */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.calendar-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 450px;
  max-width: 90vw;
  min-height: 520px;
  transform: translateY(0);
  transition: transform 0.3s ease;
}


.calendar-header {
  /* Usar --primary-color */
  background: var(--primary-color); /* Color de encabezado que coincida con tu primary-color */
  color: white;
  padding: 25px;
  text-align: center;
  position: relative;
}

.month-year {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 70px;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.4rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.prev-btn {
  left: 25px;
}

.next-btn {
  right: 25px;
}

.calendar-grid {
  padding: 25px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #666;
  font-size: 1rem;
  padding: 12px 0;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 45px;
}

.day:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Usar --primary-color en lugar de gradiente específico */
  background: var(--primary-color);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 10px;
}

.day span {
  position: relative;
  z-index: 1;
}

.day:hover:before {
  opacity: 0.1;
}

.day:hover {
  transform: scale(1.1);
}

.day.other-month {
  color: #ccc;
  cursor: default;
}

.day.other-month:hover {
  transform: none;
}

.day.other-month:before {
  display: none;
}

.day.today {
  /* Mantener este color si quieres que el "hoy" sea diferente,
     o cámbialo a un tono de primary-color si quieres uniformidad */
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); /* Color original de "hoy" */
  color: white;
  font-weight: 600;
}

.day.today:before {
  opacity: 0;
}

.day.selected {
  /* Usar --primary-color */
  background: var(--primary-color); /* Color de día seleccionado */
  color: white;
  font-weight: 600;
  transform: scale(1.05);
}

.day.today.selected {
  /* Usar --primary-color y sombra acorde */
  background: var(--primary-color);
  color: white;
  font-weight: 600;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(74, 85, 162, 0.4); /* Ajustado para un tono de azul */
}

.selected-date {
  text-align: center;
  padding: 20px 25px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  color: #666;
  font-size: 1rem;
}

/* Este estilo ahora afecta al texto normal dentro de .selected-date */
.selected-date {
  font-weight: 600; /* El texto completo será más negrita */
  color: var(--primary-color); /* Le damos el color primario a la fecha seleccionada */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.calendar-grid {
  animation: fadeIn 0.3s ease;
}

@media (max-width: 480px) {
  .calendar-container {
    width: 380px;
    margin: 10px;
  }

  .month-year {
    font-size: 1.5rem;
    margin: 0 60px;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .calendar-grid {
    padding: 20px;
  }

  .day {
    font-size: 1rem;
    min-height: 40px;
  }
}
</style>