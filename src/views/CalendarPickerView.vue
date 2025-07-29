<template>
  <div class="phone-mockup calendar-picker-view">
    <header class="calendar-header">
      <h1 class="header-title">Seleccionar Fecha</h1>
    </header>
    <main class="calendar-content">
      <DayNavigation :selected-date="selectedDate" @update:selectedDate="handleDateChange" />
    </main>
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DayNavigation from '@/components/DayNavigation.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';

const router = useRouter();
const selectedDate = ref(new Date());

const handleDateChange = (date) => {
  selectedDate.value = date;
  // Redirige a DashboardView con la fecha seleccionada como query parameter
  router.push({
    name: 'dashboard',
    query: { date: date.toISOString().split('T')[0] }
  });
};
</script>

<style scoped>
.phone-mockup {
  width: 100%;
  max-width: 1000px;
  background: #f9f9f9;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 800px;
  overflow: hidden;
  position: relative;
  margin: 20px auto;
}

.calendar-picker-view {
  padding: 0;
}

.calendar-header {
  background-color: var(--primary-color);
  color: #fff;
  padding: 25px 30px;
  text-align: center;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.calendar-content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* Estilos para el DayNavigation dentro de esta vista */
.calendar-content :deep(.day-navigation-container) {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 700px;
}

.calendar-content :deep(.day-button) {
  flex: 1;
  min-width: 80px;
  max-width: 120px;
  height: 90px;
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.calendar-content :deep(.day-button:hover) {
  border-color: var(--primary-color);
  transform: translateY(-3px);
}

.calendar-content :deep(.day-button.active) {
  background-color: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(74, 85, 162, 0.3);
}

.calendar-content :deep(.day-button.active .day-name),
.calendar-content :deep(.day-button.active .day-month),
.calendar-content :deep(.day-button.active .day-number) {
  color: white;
}

.calendar-content :deep(.day-name) {
  font-weight: 600;
  font-size: 14px;
}

.calendar-content :deep(.day-month) {
  font-size: 12px;
  opacity: 0.8;
}

.calendar-content :deep(.day-number) {
  font-size: 22px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .phone-mockup {
    max-width: none;
    border-radius: 0;
    height: 100vh;
    box-shadow: none;
    margin: 0;
  }
    .calendar-header { /* Usamos tu clase `new-dashboard-header` */
    padding: 20px 15px 10px; /* Ajustar padding en móvil */
    border-top-left-radius: 0; /* Eliminar bordes redondeados en móvil */
    border-top-right-radius: 0; /* Eliminar bordes redondeados en móvil */
  }
}
</style>
