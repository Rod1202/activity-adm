<template>
  <div class="phone-mockup calendar-picker-view">
    <header class="calendar-header">
      <h1 class="header-title">Seleccionar Fecha</h1>
    </header>
    <main class="calendar-content">
      <FullCalendarPicker :initial-date="selectedDate" @update:selectedDate="handleDateChange" />
    </main>
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importa tu nuevo componente de calendario
import FullCalendarPicker from '@/components/FullCalendarPicker.vue'; // Asegúrate de que la ruta sea correcta
import BottomNavigation from '@/components/BottomNavigation.vue';

const router = useRouter();
const selectedDate = ref(new Date()); // Inicializa con la fecha actual

const handleDateChange = (date) => {
  selectedDate.value = date;

  // Formatea la fecha usando los métodos locales del objeto Date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
  const day = String(date.getDate()).padStart(2, '0');
  const localDateString = `${year}-${month}-${day}`;

  // Redirige a DashboardView con la fecha seleccionada como query parameter
  router.push({
    name: 'dashboard',
    query: { date: localDateString } // Usa la fecha formateada localmente
  });
};
</script>

<style scoped>
/* Tu estilo para CalendarPickerView.vue permanece sin cambios */
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
  /* Los estilos :deep() de DayNavigation ya no son necesarios aquí */
}

@media (max-width: 768px) {
  .phone-mockup {
    max-width: none;
    border-radius: 0;
    height: 100vh;
    box-shadow: none;
    margin: 0;
  }
  .calendar-header {
    padding: 20px 15px 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .calendar-content {
  padding-bottom: 100px;
  
}
}
</style>