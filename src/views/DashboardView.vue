<template>
  <div class="phone-mockup dashboard-mockup">
    <header class="dashboard-header">
      <h1 class="welcome-title">BIENVENIDO {{ userName }}</h1>
      <button class="add-button" @click="goToRegisterActivity">
        <span class="plus-icon">+</span>
      </button>
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
import { supabase } from '@/services/supabaseClient'; // Para cargar actividades

// Importa los componentes que aún no has creado, los haremos a continuación
import ActivityCard from '@/components/ActivityCard.vue';
import DayNavigation from '@/components/DayNavigation.vue';

const router = useRouter();
const userName = ref('...'); // Placeholder para el nombre del usuario
const selectedDate = ref(new Date()); // Fecha actual por defecto
const activities = ref([]);
const isLoadingActivities = ref(false);

// Función para obtener las actividades del día seleccionado
const fetchActivities = async () => {
  isLoadingActivities.value = true;
  try {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/login'); // Si no hay usuario, redirige al login
      return;
    }

    // Formatear la fecha a YYYY-MM-DD para la consulta SQL
    const formattedDate = selectedDate.value.toISOString().split('T')[0];

    // Consultar Supabase para las actividades del usuario logueado en la fecha seleccionada
    const { data, error } = await supabase
      .from('Actividades')
      .select(`
        *,
        Clientes(nombre_cliente),
        CategoriasActividad(nombre_categoria)
      `)
      .eq('adm_id', user.id) // Filtra por el ID del usuario de Supabase Auth
      .eq('fecha_actividad', formattedDate)
      .order('hora_inicio', { ascending: true });

    if (error) {
      throw error;
    }
    activities.value = data || [];
  } catch (err) {
    console.error('Error al cargar actividades:', err.message);
    activities.value = []; // Vaciar actividades si hay error
    // Aquí podrías mostrar una notificación al usuario de que hubo un error
  } finally {
    isLoadingActivities.value = false;
  }
};

const handleDateChange = (newDate) => {
  selectedDate.value = newDate;
  fetchActivities(); // Recargar actividades al cambiar la fecha
};

const goToRegisterActivity = () => {
  router.push('/register-activity');
};

onMounted(async () => {
  // Obtener el nombre del usuario al cargar el componente
  try {
    const user = await getCurrentUser();
    if (user) {
      // Supabase Auth no almacena el nombre por defecto, solo email.
      // Si quieres mostrar un nombre, necesitarás almacenarlo en user_metadata
      // o en tu tabla 'Admins' y luego hacer un JOIN o fetch adicional.
      // Por ahora, mostraremos la primera parte del email o un nombre predeterminado.
      if (user.user_metadata && user.user_metadata.full_name) {
        userName.value = user.user_metadata.full_name.split(' ')[0].toUpperCase();
      } else if (user.email) {
        userName.value = user.email.split('@')[0].toUpperCase();
      }
    }
    fetchActivities(); // Cargar actividades al montar el dashboard
  } catch (error) {
    console.error('Error al obtener usuario o actividades en dashboard:', error.message);
    // Si hay un error al obtener el usuario, el guardia de navegación debería manejar la redirección
  }
});
</script>

<style scoped>
.phone-mockup {
  width: 100%;
  max-width: 400px; /* Ancho típico de un teléfono */
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  min-height: 700px; /* Altura para simular un teléfono */
  overflow: hidden; /* Asegura que el contenido no se desborde del mockup */
  position: relative;
}

.dashboard-mockup {
  padding: 0; /* Quitamos padding aquí para que el header y main ocupen todo el ancho */
}

.dashboard-header {
  background-color: var(--primary-color);
  color: white;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
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
}

.add-button:hover {
  background-color: #5a6ed1;
  transform: translateY(-2px);
}

.add-button:active {
  transform: translateY(0);
}

.plus-icon {
  font-size: 30px;
  color: white;
  line-height: 1; /* Para centrar el '+' */
}

.dashboard-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 30px;
  overflow-y: auto;
  padding-bottom: 100px; /* Espacio para la navegación de días flotante */
}

.activity-list {
  flex-grow: 1;
}

.no-activities-message, .loading-message {
  text-align: center;
  color: var(--text-color-light);
  margin-top: 50px;
  font-size: 1.1em;
}

.day-navigation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 15px 10px;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  z-index: 10;
}
</style>