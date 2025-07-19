<template>
  <div class="phone-mockup dashboard-mockup">
    <header class="dashboard-header">
      <h1 class="welcome-title">BIENVENIDO {{ userName }}</h1>
      <div class="header-buttons">
        <button class="logout-button" @click="handleLogout">
          Cerrar Sesión
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
import { supabase } from '@/services/supabaseClient'; // Para cargar actividades y cerrar sesión

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

// Nueva función para cerrar sesión
const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    // Redirigir al usuario a la página de inicio de sesión o a la página principal
    router.push('/login'); // Asegúrate de que esta ruta sea la correcta para tu página de inicio de sesión
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message);
    alert('No se pudo cerrar sesión. Por favor, intenta de nuevo.');
  }
};


onMounted(async () => {
  // Obtener el nombre del usuario al cargar el componente
  try {
    const user = await getCurrentUser();
    if (user) {
      if (user.user_metadata && user.user_metadata.full_name) {
        userName.value = user.user_metadata.full_name.split(' ')[0].toUpperCase();
      } else if (user.email) {
        userName.value = user.email.split('@')[0].toUpperCase();
      }
    }
    fetchActivities(); // Cargar actividades al montar el dashboard
  } catch (error) {
    console.error('Error al obtener usuario o actividades en dashboard:', error.message);
  }
});
</script>

<style scoped>
/* Contenedor principal del mockup (manteniendo la simulación de teléfono para este componente) */
.phone-mockup {
  width: 100%;
  max-width: 400px; /* Ancho típico de un teléfono en escritorio */
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  min-height: 700px; /* Altura para simular un teléfono */
  overflow: hidden;
  position: relative;
  /* Eliminamos el margin auto aquí si el padre (#app) ya lo centra globalmente */
}

.dashboard-mockup {
  padding: 0;
}

.dashboard-header {
  background-color: var(--primary-color);
  color: white;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between; /* Para separar el título de los botones */
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
  flex-grow: 1; /* Permite que el título ocupe el espacio restante */
}

.header-buttons {
  display: flex;
  gap: 15px; /* Espacio entre el botón de cerrar sesión y el de añadir */
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

/* Estilos para el nuevo botón de cerrar sesión */
.logout-button {
  background-color: #f44336; /* Un color rojo distintivo */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px; /* Ajustado para que sea un poco más pequeño que el de registro */
  font-size: 0.95em; /* Un poco más pequeño que el texto normal */
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* Evita que el botón se encoja */
}

.logout-button:hover {
  background-color: #d32f2f; /* Tono más oscuro al pasar el ratón */
  transform: translateY(-2px);
}

.logout-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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

/* Media queries para responsividad */
@media (max-width: 768px) {
  /* En móvil, el phone-mockup ya debería ser de extremo a extremo por los estilos globales */
  .phone-mockup {
    max-width: none; /* Elimina el límite de ancho máximo para móvil */
    border-radius: 0; /* Quita los bordes redondeados */
    min-height: 100vh; /* Ocupa toda la altura */
    box-shadow: none; /* Elimina la sombra */
  }

  .dashboard-header {
    flex-direction: column; /* Apila el título y los botones */
    align-items: flex-start;
    padding: 20px;
    border-top-left-radius: 0; /* Quita bordes redondeados del header en móvil */
    border-top-right-radius: 0;
  }

  .welcome-title {
    font-size: 1.8em;
    margin-bottom: 15px; /* Espacio entre título y botones */
  }

  .header-buttons {
    width: 100%; /* Los botones ocupan todo el ancho disponible */
    justify-content: space-around; /* Distribuye los botones equitativamente */
    gap: 10px; /* Ajusta el espacio entre los botones en móvil */
  }

  .logout-button, .add-button {
    flex-grow: 1; /* Permite que ambos botones crezcan para llenar el espacio */
    padding: 12px 15px; /* Ajusta el padding para que no sean demasiado grandes */
    font-size: 1em;
    height: auto; /* Permite que la altura se ajuste con el padding */
    border-radius: 8px; /* Haz el botón de añadir cuadrado también en móvil */
  }

  .add-button .plus-icon {
      font-size: 24px; /* Ajusta el tamaño del icono más para móvil */
  }

  .dashboard-content {
    padding: 15px 20px; /* Ajusta el padding para móviles */
    border-radius: 0; /* Sin bordes redondeados en móvil */
  }

  .day-navigation {
    border-bottom-left-radius: 0; /* Quita los bordes redondeados del navegador de días */
    border-bottom-right-radius: 0;
  }
}
</style>