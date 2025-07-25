<template>
  <div class="phone-mockup register-activity-mockup">
    <header class="register-activity-header">
      <button class="back-button" @click="goBack">&lt;</button>
      <h1 class="title">Registrar Actividad</h1>
    </header>

    <main class="register-activity-content">
      <form @submit.prevent="saveActivity">
        <div class="form-group">
          <label for="client" class="form-label">Cliente</label>
          <select id="client" v-model="selectedClient" class="form-input" required>
            <option value="">Seleccionar cliente</option>
            <option v-for="client in clients" :key="client.cliente_id" :value="client.cliente_id">
              {{ client.nombre_cliente }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="category" class="form-label">Categoría</label>
          <select id="category" v-model="selectedCategory" class="form-input" required>
            <option value="">Seleccionar categoría</option>
            <option v-for="category in categories" :key="category.categoria_id" :value="category.categoria_id">
              {{ category.nombre_categoria }}
            </option>
          </select>
        </div>

        <div class="two-columns-group">
          <div class="form-group">
            <label for="date" class="form-label">Fecha</label>
            <input type="date" id="date" v-model="activityDate" class="form-input" required>
          </div>

          <div class="form-group">
            <label for="start-time" class="form-label">Hora de Inicio</label>
            <div class="input-with-button">
              <input type="time" id="start-time" v-model="startTime" class="form-input" required>
              <button type="button" class="btn-edit" @click="toggleEditEndTime">
                <i class="fi fi-rs-clock-desk"></i> </button>
            </div>
          </div>
        </div>

        <div class="form-group" v-if="showEditEndTime">
          <label for="end-time-manual" class="form-label">Hora de Fin (Manual)</label>
          <input type="time" id="end-time-manual" v-model="manualEndTime" class="form-input" required>
        </div>


        <div class="two-columns-group">
          <div class="form-group">
            <label for="duration" class="form-label">Duración (HH:MM:SS)</label>
            <input type="text" id="duration" :value="formatDuration(manualDurationSeconds)" class="form-input" readonly>
          </div>

          <div class="form-group">
            <label for="priority" class="form-label">Prioridad</label>
            <select id="priority" v-model="priority" class="form-input">
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        <!-- Solo mostrar el cronómetro si no se está editando la hora de fin manual -->
        <div class="chronometer-section" v-if="!showEditEndTime">
          <p class="chronometer-display">{{ formatDuration(chronometerSeconds) }}</p>
          <div class="chronometer-controls">
            <button type="button" class="start-button" @click="startChronometer" :disabled="isChronometerRunning">Iniciar</button>
            <button type="button" class="stop-button" @click="stopChronometer" :disabled="!isChronometerRunning">Detener</button>
          </div>
          <p class="chronometer-status">{{ isChronometerRunning ? 'Cronómetro en marcha' : 'Cronómetro detenido' }}</p>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">Descripción (opcional)</label>
          <input id="description" v-model="description" class="form-input" type="text" placeholder="Describe los detalles de la actividad..." maxlength="255" />
        </div>

        <div class="action-buttons">
          <button type="submit" class="register-button" :disabled="isLoading">
            {{ isLoading ? 'Registrando...' : 'Registrar' }}
          </button>
        </div>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <!-- Reemplazar el mensaje de error por un icono flotante -->
        <div v-if="errorMessage" class="floating-error-icon" :title="errorMessage">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#fff"/>
            <path d="M8 8L16 16M16 8L8 16" stroke="#d32f2f" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/services/supabaseClient';
import { getCurrentUser } from '@/services/authService';

const router = useRouter();

const clients = ref([]);
const categories = ref([]);
const selectedClient = ref('');
const selectedCategory = ref('');
const description = ref('');
const activityDate = ref(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
const startTime = ref('');
const manualEndTime = ref(''); // Nuevo: para la hora de fin ingresada manualmente
const showEditEndTime = ref(false); // Nuevo: controla la visibilidad del campo de hora de fin
const priority = ref('Media'); // Default value

const manualDurationSeconds = ref(0);
const chronometerSeconds = ref(0);
const isChronometerRunning = ref(false);
let chronometerInterval = null;

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// --- Funciones para el cronómetro ---
const startChronometer = () => {
  if (!isChronometerRunning.value) {
    isChronometerRunning.value = true;
    chronometerInterval = setInterval(() => {
      chronometerSeconds.value++;
    }, 1000);
  }
};

const stopChronometer = () => {
  if (isChronometerRunning.value) {
    isChronometerRunning.value = false;
    clearInterval(chronometerInterval);
    manualDurationSeconds.value = chronometerSeconds.value; // Guardar la duración del cronómetro
  }
};

const resetChronometer = () => {
  stopChronometer();
  chronometerSeconds.value = 0;
  manualDurationSeconds.value = 0;
};

// Formato HH:MM:SS
const formatDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// --- Funciones de formulario y Supabase ---
const fetchClientsAndCategories = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      errorMessage.value = 'Usuario no autenticado. Por favor, inicia sesión.';
      router.push('/login');
      return;
    }
    const { data: clientsData, error: clientsError } = await supabase
      .from('clientes')
      .select('cliente_id, nombre_cliente')
      .eq('adm_id', user.id);
    if (clientsError) throw clientsError;
    clients.value = clientsData || [];

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categoriasactividad')
      .select('categoria_id, nombre_categoria');
    if (categoriesError) throw categoriesError;
    categories.value = categoriesData || [];
  } catch (error) {
    console.error('Error fetching clients or categories:', error.message);
    errorMessage.value = 'Error al cargar clientes o categorías.';
  }
};

const toggleEditEndTime = () => {
  showEditEndTime.value = !showEditEndTime.value;
  if (!showEditEndTime.value) {
    manualEndTime.value = ''; // Limpia el campo si se oculta
  } else {
    manualEndTime.value = calculateApproximateEndTime();
  }
};

const calculateApproximateEndTime = () => {
    if (!startTime.value) return '';

    const startDateTime = new Date(`${activityDate.value}T${startTime.value}`);
    const durationToAdd = isChronometerRunning.value ? 0 : manualDurationSeconds.value;
    const endDateTime = new Date(startDateTime.getTime() + durationToAdd * 1000);

    return endDateTime.toTimeString().split(' ')[0].substring(0, 5);
};


const saveActivity = async () => {
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const user = await getCurrentUser();
    if (!user) {
      errorMessage.value = 'Usuario no autenticado. Por favor, inicia sesión.';
      router.push('/login');
      return;
    }

    if (!selectedClient.value || !selectedCategory.value || !activityDate.value || !startTime.value) {
      errorMessage.value = 'Por favor, completa los campos obligatorios (Cliente, Categoría, Fecha, Hora de Inicio).';
      return;
    }

    let finalDurationSeconds = manualDurationSeconds.value;
    let finalEndTime = '';

    if (showEditEndTime.value) {
        if (!manualEndTime.value) {
            errorMessage.value = 'Por favor, ingresa la Hora de Fin manual.';
            return;
        }
        finalEndTime = manualEndTime.value;
        const startDateTime = new Date(`${activityDate.value}T${startTime.value}`);
        const endDateTime = new Date(`${activityDate.value}T${manualEndTime.value}`);
        if (endDateTime < startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }
        const durationMs = endDateTime.getTime() - startDateTime.getTime();
        finalDurationSeconds = Math.floor(durationMs / 1000);
        if (finalDurationSeconds <= 0) {
             errorMessage.value = 'La hora de fin debe ser posterior a la hora de inicio.';
             return;
        }
    } else {
        if (chronometerSeconds.value <= 0) {
            errorMessage.value = 'La duración de la actividad debe ser mayor a cero. Inicia y detén el cronómetro o ingresa una hora de fin manual.';
            return;
        }
        finalDurationSeconds = chronometerSeconds.value;
        const startDateTime = new Date(`${activityDate.value}T${startTime.value}`);
        const endDateTime = new Date(startDateTime.getTime() + finalDurationSeconds * 1000);
        finalEndTime = endDateTime.toTimeString().split(' ')[0].substring(0, 5);
    }


    const { error } = await supabase
      .from('actividades')
      .insert({
        cliente_id: selectedClient.value,
        categoria_id: selectedCategory.value,
        descripcion: description.value || null,
        fecha_actividad: activityDate.value,
        hora_inicio: startTime.value,
        hora_fin: finalEndTime,
        duracion_segundos: finalDurationSeconds,
        prioridad: priority.value,
        adm_id: user.id,
        usado_cronometro: showEditEndTime.value ? false : true
      });

    if (error) {
      throw error;
    }

    successMessage.value = 'Actividad registrada exitosamente!';
    resetForm();
    router.push('/');
  } catch (err) {
    console.error('Error al registrar actividad:', err.message);
    errorMessage.value = err.message || 'Error desconocido al registrar la actividad.';
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  selectedClient.value = '';
  selectedCategory.value = '';
  description.value = '';
  activityDate.value = new Date().toISOString().split('T')[0];
  startTime.value = '';
  manualEndTime.value = '';
  showEditEndTime.value = false;
  priority.value = 'Media';
  resetChronometer();
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  fetchClientsAndCategories();
  const now = new Date();
  startTime.value = now.toTimeString().split(' ')[0].substring(0, 5);
});

onUnmounted(() => {
  if (chronometerInterval) {
    clearInterval(chronometerInterval);
  }
});
</script>

<style scoped>
/* Contenedor principal y estructura general */
/* Este contenedor ahora se adaptará al ancho de la pantalla */
.phone-mockup {
  width: 100%;
  max-width: 1000px; /* Ancho amplio para escritorio */
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 800px; /* Altura ajustada a 900px para evitar scrollbar */
  overflow: hidden;
  position: relative;
  margin: 20px auto; /* Centra el contenedor */
}

.register-activity-mockup {
  padding: 0;
}

/* Encabezado */
.register-activity-header {
  background-color: var(--primary-color);
  color: #fff;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  position: relative;
  flex-shrink: 0; /* Evita que el header se encoja */
}

.register-activity-header .title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  flex-grow: 1;
  text-align: center;
}

.back-button {
  background: none;
  border: none;
  font-size: 28px;
  color: #fff;
  cursor: pointer;
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 5px 10px;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: var(--accent-purple);
}

/* Contenido principal del formulario */
.register-activity-content {
  flex-grow: 1;
  padding: 20px 30px;
  overflow-y: auto;
  min-height: 0; /* Permite que el contenido se encoja si es necesario */
  position: relative; /* Para posicionar el error de forma absoluta */
}

/* Grupos de formulario */
.form-group {
  margin-bottom: 20px;
  flex-shrink: 0; /* Evita que los grupos se encojan */
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--accent-darkblue);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.2s ease;
  background-color: #fff;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 102, 246, 0.15);
}

/* Estilos específicos para select */
select.form-input {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%234A55A2'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 1em;
  padding-right: 30px;
}

/* Eliminar el estilo específico de textarea.form-input si existe */
textarea.form-input {
  /* eliminado para que no afecte al nuevo input */
}

/* Diseño de dos columnas para algunos grupos */
.two-columns-group {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.two-columns-group .form-group {
  flex: 1;
  margin-bottom: 0;
}

/* Input con botón (para la hora de inicio) */
.input-with-button {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-with-button .form-input {
  flex-grow: 1;
}

/* Estilo para el botón "Editar" */
.btn-edit {
  background-color: #FFFFFF;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 48px;
}

.btn-edit i {
    font-size: 1.2em;
    color: inherit;
}

.btn-edit:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.btn-edit:hover i {
    color: white;
}

.btn-edit:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

/* Sección del cronómetro */
.chronometer-section {
  text-align: center;
  margin-bottom: 10px; /* Más reducido */
  background-color: var(--secondary-color);
  color: #fff;
  border-radius: 12px;
  padding: 8px 6px; /* Más reducido */
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.chronometer-display {
  font-size: 1.4em; /* Más reducido */
  font-weight: 700;
  color: #7a7a7a;
  margin-bottom: 6px; /* Más reducido */
  font-family: 'Roboto Mono', monospace;
}

.chronometer-controls {
  display: flex;
  justify-content: center;
  gap: 6px; /* Más reducido */
  margin-bottom: 4px; /* Más reducido */
}

.chronometer-controls button {
  padding: 6px 12px; /* Más reducido */
  border: none;
  border-radius: 8px;
  font-size: 0.95em; /* Más reducido */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.start-button {
  background-color: #4CAF50;
  color: white;
}

.start-button:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-2px);
}

.start-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.stop-button {
  background-color: #F44336;
  color: white;
}

.stop-button:hover:not(:disabled) {
  background-color: #da3e32;
  transform: translateY(-2px);
}

.stop-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chronometer-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.chronometer-status {
  font-size: 0.75em; /* Más reducido */
  color: var(--text-color-medium);
  margin-bottom: 0;
}

/* Botones de acción al final del formulario */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  flex-shrink: 0; /* Evita que los botones se encojan */
}

.action-buttons button {
  width: 100%;
  max-width: 250px;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-button {
  background-color: var(--primary-color);
  color: #fff;
}

.register-button:hover:not(:disabled) {
  background-color: var(--accent-darkblue);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.18);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.register-button:disabled {
  background-color: #a0a8d3;
  cursor: not-allowed;
  box-shadow: none;
}

/* Mensajes de éxito y error */
.success-message {
  color: var(--success-color);
  text-align: center;
  margin-top: 20px;
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0; /* Evita que los mensajes se encojan */
}

.error-message {
  color: var(--error-color);
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  margin: 0 auto;
  background: transparent;
  z-index: 2;
}

/* Media queries para responsividad */
@media (max-width: 768px) { /* Este breakpoint es para tablets y móviles */
  .phone-mockup {
    width: 100%; /* Ocupa todo el ancho en pantallas más pequeñas */
    max-width: none; /* Elimina el límite de ancho máximo */
    border-radius: 0; /* Sin bordes redondeados en los extremos para ocupar toda la pantalla */
    height: 100vh; /* Ocupa toda la altura de la vista */
    margin: 0; /* Elimina el margen para que se pegue a los bordes */
    box-shadow: none; /* Quita la sombra para una apariencia de "app" nativa */
  }

  .register-activity-header {
    border-top-left-radius: 0; /* Quita los bordes redondeados del header */
    border-top-right-radius: 0;
  }

  .register-activity-content {
    padding: 15px 20px; /* Ajusta el padding para móviles */
  }

  .form-input, select.form-input {
    padding: 10px 12px;
    font-size: 15px;
  }

  .two-columns-group {
    flex-direction: column; /* Apilar columnas en pantallas pequeñas */
    gap: 15px;
  }
  .chronometer-display {
    font-size: 3em;
  }
  .chronometer-controls button {
    padding: 12px 20px;
    font-size: 1em;
  }
  .action-buttons button {
    padding: 14px;
    font-size: 16px;
    max-width: 100%; /* Asegura que en móviles ocupe el 100% */
  }
  .btn-edit {
    width: 45px;
    height: 45px;
    padding: 0;
  }
}

/* Icono flotante de error */
.floating-error-icon {
  position: fixed;
  left: 40px;
  bottom: 40px;
  z-index: 1000;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  padding: 4px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.floating-error-icon:hover {
  box-shadow: 0 4px 16px rgba(211,47,47,0.18);
}
.floating-error-icon svg {
  display: block;
}
</style>